import { useArticleDetail } from '@/hooks/useArticleDetail';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useReadingProgressWithScroll } from '@/hooks/useReadingProgressWithScroll';
import { buildArticleImageUrl } from '@/services/article-detail.service';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const scrollViewRef = useRef<ScrollView>(null);

  const { progress } = useReadingProgress(id ?? '');

  const { handleScroll } = useReadingProgressWithScroll({
    articleId: id,
    scrollViewRef,
    initialScrollY: progress,
  });

  const {
    data: article,
    isLoading,
    isError,
    error,
    refetch,
  } = useArticleDetail(id ?? '');

  const onBack = useCallback(() => {
    router.back();
  }, [router.back]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#208AEF"
        />

        <Text style={styles.message}>
          Loading article...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Failed to load article
        </Text>

        <Text style={styles.message}>
          {error?.message}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Article not found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
        >
          <Image
            source={require('@/assets/images/ic-back.png')}
            style={styles.iconBack}
            contentFit="contain"
          />
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {article.title}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <Image
          source={{
            uri: buildArticleImageUrl(
              article.image
            ),
          }}
          style={styles.heroImage}
          contentFit="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title}>
            {article.title}
          </Text>

          <Text style={styles.date}>
            {formatDate(article.date)}
          </Text>

          <Markdown style={markdownStyles}>
            {article.body}
          </Markdown>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBack: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#208AEF',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#020202',
    lineHeight: 26,
    fontFamily: 'ComicBook',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#020202',
    lineHeight: 32,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#959697',
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#959697',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF4D4F',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 28,
    fontWeight: 400,
    color: '#959697',
  },

  heading1: {
    fontSize: 14,
    fontWeight: '400',
    color: '#959697',
  },

  heading2: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 10,
  },

  bullet_list: {
    marginVertical: 8,
  },

  code_inline: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 4,
  },

  fence: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },

  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#208AEF',
    paddingLeft: 12,
    marginVertical: 12,
  },
});