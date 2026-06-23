import { Article, buildImageUrl } from '@/services/articles.service';
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { ImageStyle, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const ArticleCard = memo<ArticleCardProps>(
  ({ article, onPress, containerStyle, imageStyle }) => {

    const formatDate = useCallback((dateString: string): string => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return dateString;
        }
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        };

        return date.toLocaleDateString('id-ID', options);
      } catch (error) {
        return dateString;
      }
    }, []);

    return (
      <Pressable
        testID={`article-card-${article.id}`}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
          containerStyle,
        ]}
        onPress={onPress}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        accessibilityRole="button"
        accessibilityLabel={`Article: ${article.title}`}
        accessibilityHint="Double tap to read full article"
      >
        <Image
          source={{
            uri: buildImageUrl(article.banner_url),
          }}
          style={styles.banner}
          contentFit="cover"
        />
        <View style={styles.content}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {article.title}
          </Text>
          <Text style={styles.date}>
            {formatDate(article.date)}
          </Text>
        </View>
      </Pressable>
    );
  },

  (prevProps, nextProps) => {
    return prevProps.article.id === nextProps.article.id;
  }

);

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 20,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  banner: {
    width: '100%',
    height: 212,
    borderRadius: 6,
  },

  content: {
    paddingVertical: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020202',
    lineHeight: 26,
    marginBottom: 4,
    fontFamily: 'ComicBook',
  },

  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#959697',
    lineHeight: 17,
  },
});

export default ArticleCard;
