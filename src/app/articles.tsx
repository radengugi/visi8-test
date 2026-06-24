import ArticleCard from '@/components/article-card';
import { useArticles } from '@/hooks/useArticles';
import { Article } from '@/services/articles.service';
import { useAuthActions } from '@/stores/auth.store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ArticlesScreen() {
  const router = useRouter();
  const { logout } = useAuthActions();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArticles();

  const articles = data?.pages.flatMap((page) => page.items) ?? [];

  const handleArticlePress = useCallback(
    (articleId: string) => {
      router.push(`/article/${articleId}`);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage,]);

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard
        article={item}
        onPress={() => handleArticlePress(item.id)}
      />
    ),
    [handleArticlePress]
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#208AEF"
        />
        <Text style={styles.message}>
          Loading articles...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Failed to load articles
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          HOME OF EVENTS
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          testID="logout-button"
        >
          <Image
            source={require('@/assets/images/QR.svg')}
            style={styles.logoutIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.message}>
              No articles found
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    color: '#020202',
    fontFamily: 'ComicBook',
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  center: {
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
    marginBottom: 8,
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});