import {
  getProgressPercentage,
  isArticleRead,
  useReadingProgressActions
} from '@/stores/reading.store';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Reading Progress Example Component
 * Demonstrates how to use the reading progress store
 */
export const ReadingProgressExample: React.FC = () => {
  const { saveProgress, getProgress, clearProgress, hydrateProgress } = useReadingProgressActions();

  // Hydrate progress on component mount
  useEffect(() => {
    hydrateProgress();
  }, [hydrateProgress]);

  // Mock article data
  const articles = [
    { id: 'article-1', title: 'Introduction to React Native', totalHeight: 5000 },
    { id: 'article-2', title: 'Advanced TypeScript Patterns', totalHeight: 7000 },
    { id: 'article-3', title: 'State Management with Zustand', totalHeight: 4500 },
  ];

  /**
   * Handle scroll event to save progress
   */
  const handleScroll = async (articleId: string, scrollY: number) => {
    try {
      await saveProgress(articleId, scrollY);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  /**
   * Simulate reading an article
   */
  const simulateReading = async (articleId: string, scrollY: number) => {
    await handleScroll(articleId, scrollY);
  };

  /**
   * Get progress for an article
   */
  const getArticleProgress = (articleId: string) => {
    return getProgress(articleId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Progress Example</Text>

      {/* Article List */}
      {articles.map(article => {
        const progress = getArticleProgress(article.id);
        const percentage = progress
          ? getProgressPercentage(progress.scrollY, article.totalHeight)
          : 0;
        const isRead = progress
          ? isArticleRead(progress.scrollY, article.totalHeight)
          : false;

        return (
          <View key={article.id} style={styles.articleCard}>
            <Text style={styles.articleTitle}>{article.title}</Text>

            {progress ? (
              <>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Progress: {percentage.toFixed(1)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                        isRead && styles.progressComplete,
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.detailText}>
                  Scroll: {progress.scrollY}px / {article.totalHeight}px
                </Text>
                <Text style={styles.detailText}>
                  Last updated: {new Date(progress.updatedAt).toLocaleString()}
                </Text>

                {isRead && <Text style={styles.completedText}>✓ Completed</Text>}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => simulateReading(article.id, progress.scrollY + 500)}
                >
                  <Text style={styles.buttonText}>Simulate Reading (+500px)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={() => clearProgress(article.id)}
                >
                  <Text style={styles.buttonText}>Clear Progress</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.noProgressText}>No progress saved</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => simulateReading(article.id, 100)}
                >
                  <Text style={styles.buttonText}>Start Reading</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}

      {/* Quick Actions */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => simulateReading('article-1', 4500)}
        >
          <Text style={styles.buttonText}>
            Simulate: Article 1 (90% complete)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => simulateReading('article-2', 1000)}
        >
          <Text style={styles.buttonText}>
            Simulate: Article 2 (14% complete)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => simulateReading('article-3', 4000)}
        >
          <Text style={styles.buttonText}>
            Simulate: Article 3 (89% complete)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  articleCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#2196F3',
  },
  detailText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 10,
  },
  noProgressText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default ReadingProgressExample;
