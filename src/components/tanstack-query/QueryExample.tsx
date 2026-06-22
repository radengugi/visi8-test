import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  useArticle,
  useArticleList,
  useArticleSearch,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useLikeArticle,
  usePrefetchArticle,
} from '@/hooks/useArticles';

/**
 * TanStack Query Example Component
 * Demonstrates various query patterns and cache strategies
 */
export const QueryExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'detail' | 'search'>('list');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('article-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Query hooks
  const articleList = useArticleList({ query: '', page: 1, pageSize: 10 });
  const article = useArticle(selectedArticleId);
  const articleSearch = useArticleSearch({
    query: searchQuery,
    page: 1,
    pageSize: 10,
  });

  // Mutation hooks
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const likeArticle = useLikeArticle();
  const prefetchArticle = usePrefetchArticle();

  /**
   * Handle article creation
   */
  const handleCreateArticle = async () => {
    try {
      await createArticle.mutateAsync({
        title: 'New Article',
        content: 'This is a new article created with TanStack Query',
        excerpt: 'New article excerpt',
        author: 'John Doe',
        category: 'Technology',
        tags: ['react', 'query'],
      });
      // Refresh list
      articleList.refetch();
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  /**
   * Handle article update
   */
  const handleUpdateArticle = async () => {
    if (!article.data) return;

    try {
      await updateArticle.mutateAsync({
        id: article.data.id,
        data: { title: 'Updated Article Title' },
      });
    } catch (error) {
      console.error('Failed to update article:', error);
    }
  };

  /**
   * Handle article deletion
   */
  const handleDeleteArticle = async () => {
    if (!article.data) return;

    try {
      await deleteArticle.mutateAsync(article.data.id);
      setSelectedArticleId('article-1');
      articleList.refetch();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  /**
   * Handle article like
   */
  const handleLikeArticle = async () => {
    if (!article.data) return;

    try {
      await likeArticle.mutateAsync(article.data.id);
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  /**
   * Handle prefetch
   */
  const handlePrefetch = (articleId: string) => {
    prefetchArticle(articleId);
  };

  /**
   * Render article list tab
   */
  const renderListTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Article List</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => articleList.refetch()}
        >
          <Text style={styles.actionButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {articleList.isLoading && !articleList.isFetching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      ) : articleList.isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Error: {articleList.error?.message || 'Failed to load articles'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => articleList.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.articleList}>
          {articleList.data?.articles.map((item) => (
            <View key={item.id} style={styles.articleItem}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleTitle}>{item.title}</Text>
                <Text style={styles.articleMeta}>
                  {item.views} views • {item.likes} likes
                </Text>
              </View>

              <View style={styles.articleActions}>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => {
                    setSelectedArticleId(item.id);
                    setActiveTab('detail');
                  }}
                >
                  <Text style={styles.smallButtonText}>View Detail</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => handlePrefetch(item.id)}
                >
                  <Text style={styles.smallButtonText}>Prefetch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => {
                    setSelectedArticleId(item.id);
                    handleLikeArticle();
                  }}
                >
                  <Text style={styles.smallButtonText}>Like</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cacheInfo}>
                <Text style={styles.cacheInfoText}>
                  Cached for: 2 minutes (stale) • GC: 15 minutes
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              Page {articleList.data?.page} of {Math.ceil((articleList.data?.total || 0) / (articleList.data?.pageSize || 10))}
            </Text>
            <Text style={styles.paginationText}>
              Total: {articleList.data?.total} articles
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );

  /**
   * Render article detail tab
   */
  const renderDetailTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Article Detail</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedArticleId('article-1');
            setActiveTab('list');
          }}
        >
          <Text style={styles.actionButtonText}>Back to List</Text>
        </TouchableOpacity>
      </View>

      {article.isLoading && !article.isFetching ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      ) : article.isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Error: {article.error?.message || 'Failed to load article'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => article.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : article.data ? (
        <ScrollView style={styles.articleDetail}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{article.data.title}</Text>

            <View style={styles.detailMeta}>
              <Text style={styles.detailMetaText}>Author: {article.data.author}</Text>
              <Text style={styles.detailMetaText}>Category: {article.data.category}</Text>
              <Text style={styles.detailMetaText}>
                Reading Time: {article.data.readingTime} min
              </Text>
              <Text style={styles.detailMetaText}>
                {article.data.views} views • {article.data.likes} likes
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailContentText}>{article.data.content}</Text>
            </View>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={handleUpdateArticle}
                disabled={updateArticle.isPending}
              >
                <Text style={styles.detailButtonText}>
                  {updateArticle.isPending ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.detailButton, styles.deleteButton]}
                onPress={handleDeleteArticle}
                disabled={deleteArticle.isPending}
              >
                <Text style={styles.detailButtonText}>
                  {deleteArticle.isPending ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={handleLikeArticle}
                disabled={likeArticle.isPending}
              >
                <Text style={styles.detailButtonText}>
                  {likeArticle.isPending ? 'Liking...' : `Like (${article.data.likes})`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => article.refetch()}
              >
                <Text style={styles.detailButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cacheInfo}>
              <Text style={styles.cacheInfoText}>
                Cached for: 5 minutes (stale) • GC: 30 minutes
              </Text>
              <Text style={styles.cacheInfoText}>
                Last updated: {new Date(article.data.updatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );

  /**
   * Render search tab
   */
  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Articles</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {articleSearch.isFetching && (
          <ActivityIndicator size="small" color="#2196F3" style={styles.searchSpinner} />
        )}
      </View>

      {searchQuery.length > 0 && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            Searching for: "{searchQuery}"
          </Text>
        </View>
      )}

      {articleSearch.data && searchQuery.length > 0 && (
        <ScrollView style={styles.searchResults}>
          <Text style={styles.resultsCount}>
            Found {articleSearch.data.total} results
          </Text>

          {articleSearch.data.articles.map((item) => (
            <View key={item.id} style={styles.searchResultItem}>
              <Text style={styles.searchResultTitle}>{item.title}</Text>
              <Text style={styles.searchResultMeta}>
                {item.category} • {item.readingTime} min read
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {searchQuery.length > 0 && !articleSearch.isFetching && !articleSearch.data && (
        <View style={styles.centerContent}>
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.activeTabButton]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'list' && styles.activeTabButtonText]}>
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'detail' && styles.activeTabButton]}
          onPress={() => setActiveTab('detail')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'detail' && styles.activeTabButtonText]}>
            Detail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'search' && styles.activeTabButton]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'search' && styles.activeTabButtonText]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Actions */}
      <View style={styles.globalActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateArticle}
          disabled={createArticle.isPending}
        >
          <Text style={styles.createButtonText}>
            {createArticle.isPending ? 'Creating...' : 'Create New Article'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'list' && renderListTab()}
      {activeTab === 'detail' && renderDetailTab()}
      {activeTab === 'search' && renderSearchTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#2196F3',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#2196F3',
  },
  globalActions: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  articleList: {
    flex: 1,
    padding: 15,
  },
  articleItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  articleHeader: {
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  articleMeta: {
    fontSize: 12,
    color: '#999',
  },
  articleActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  smallButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  cacheInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cacheInfoText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  pagination: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  articleDetail: {
    flex: 1,
    padding: 15,
  },
  detailCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailMeta: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailMetaText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  detailContent: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailContentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  detailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  detailButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginRight: 10,
  },
  searchSpinner: {
    marginRight: 10,
  },
  searchInfo: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInfoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
    padding: 15,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '600',
  },
  searchResultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  searchResultMeta: {
    fontSize: 12,
    color: '#999',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default QueryExample;
