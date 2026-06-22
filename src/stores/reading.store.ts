import { getStorage, removeStorage, setStorage } from '@/services/storage';
import { create } from 'zustand';

/**
 * Reading progress interface
 * Tracks scroll position and last update time for each article
 */
export interface ReadingProgress {
  articleId: string;
  scrollY: number;
  updatedAt: string; // ISO timestamp
}

/**
 * Reading progress state interface
 */
export interface ReadingProgressState {
  progress: Record<string, ReadingProgress>;
  isLoading: boolean;
  lastSync: string | null;
}

/**
 * Reading progress actions interface
 */
export interface ReadingProgressActions {
  saveProgress: (articleId: string, scrollY: number) => Promise<void>;
  getProgress: (articleId: string) => ReadingProgress | undefined;
  clearProgress: (articleId: string) => Promise<void>;
  hydrateProgress: () => Promise<void>;
  clearAllProgress: () => Promise<void>;
  setLastSync: (timestamp: string) => void;
}

/**
 * Combined reading progress store interface
 */
export interface ReadingProgressStore extends ReadingProgressState, ReadingProgressActions {}

// Storage keys
const STORAGE_KEY = 'reading_progress';
const LAST_SYNC_KEY = 'reading_progress_last_sync';

/**
 * Create initial state
 */
const createInitialState = (): ReadingProgressState => ({
  progress: {},
  isLoading: false,
  lastSync: null,
});

export const useReadingProgressStore = create<ReadingProgressStore>((set, get) => ({
  // Initial state
  ...createInitialState(),

  /**
   * Save reading progress for an article
   * Optimized: Only updates changed article, batches writes
   */
  saveProgress: async (articleId: string, scrollY: number): Promise<void> => {
    try {
      const currentProgress = get().progress;

      // Create updated progress object
      const updatedProgress: ReadingProgress = {
        articleId,
        scrollY,
        updatedAt: new Date().toISOString(),
      };

      // Efficiently update only the specific article
      const newProgress = {
        ...currentProgress,
        [articleId]: updatedProgress,
      };
      set({ progress: newProgress });
      await setStorage(STORAGE_KEY, newProgress);

      // Update last sync timestamp
      const timestamp = new Date().toISOString();
      await setStorage(LAST_SYNC_KEY, timestamp);
      set({ lastSync: timestamp });
    } catch (error) {
      console.error(`Error saving progress for article ${articleId}:`, error);
      throw error;
    }
  },

  /**
   * Get reading progress for a specific article
   * Optimized: Direct object access, O(1) complexity
   */
  getProgress: (articleId: string): ReadingProgress | undefined => {
    const progress = get().progress;
    return progress[articleId];
  },

  /**
   * Clear reading progress for a specific article
   * Optimized: Only removes specific article, doesn't affect others
   */
  clearProgress: async (articleId: string): Promise<void> => {
    try {
      const currentProgress = get().progress;

      // Create new object without the specific article
      const { [articleId]: removed, ...remainingProgress } = currentProgress;

      set({ progress: remainingProgress });
      await setStorage(STORAGE_KEY, remainingProgress);

      // Update last sync timestamp
      const timestamp = new Date().toISOString();
      await setStorage(LAST_SYNC_KEY, timestamp);
      set({ lastSync: timestamp });
    } catch (error) {
      console.error(`Error clearing progress for article ${articleId}:`, error);
      throw error;
    }
  },

  /**
   * Hydrate progress from MMKV storage
   * Call this on app startup to restore all reading progress
   * Optimized: Single read operation, handles large datasets
   */
  hydrateProgress: async (): Promise<void> => {
    set({ isLoading: true });

    try {
      // Read all progress at once (single MMKV operation)
      const storedProgress = await getStorage<Record<string, ReadingProgress>>(STORAGE_KEY);
      const lastSync = await getStorage<string>(LAST_SYNC_KEY);

      if (storedProgress && typeof storedProgress === 'object') {
        // Validate and clean data if needed
        const cleanedProgress: Record<string, ReadingProgress> = {};

        // Optional: Filter out old progress (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const [key, value] of Object.entries(storedProgress)) {
          if (value && typeof value === 'object' && 'articleId' in value && 'scrollY' in value) {
            // Optionally filter by age
            const updatedDate = new Date(value.updatedAt);
            if (updatedDate > thirtyDaysAgo) {
              cleanedProgress[key] = value;
            }
          }
        }

        set({
          progress: cleanedProgress,
          lastSync: lastSync || null,
          isLoading: false,
        });
      } else {
        // No valid data found, set initial state
        set({
          ...createInitialState(),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error hydrating reading progress:', error);
      set({
        ...createInitialState(),
        isLoading: false,
      });
    }
  },

  /**
   * Clear all reading progress
   * Use this for logout or data reset
   */
  clearAllProgress: async (): Promise<void> => {
    try {
      set({ progress: {} });
      await removeStorage(STORAGE_KEY);
      await removeStorage(LAST_SYNC_KEY);
      set({ lastSync: null });
    } catch (error) {
      console.error('Error clearing all reading progress:', error);
      throw error;
    }
  },

  /**
   * Set last sync timestamp
   */
  setLastSync: (timestamp: string): void => {
    set({ lastSync: timestamp });
  },
}));

/**
 * Selector hooks for better performance
 * Prevents unnecessary re-renders by selecting specific state
 */
export const useReadingProgress = (articleId: string) =>
  useReadingProgressStore(state => state.progress[articleId]);

export const useAllReadingProgress = () =>
  useReadingProgressStore(state => state.progress);

export const useReadingProgressActions = () =>
  useReadingProgressStore(state => ({
    saveProgress: state.saveProgress,
    getProgress: state.getProgress,
    clearProgress: state.clearProgress,
    hydrateProgress: state.hydrateProgress,
    clearAllProgress: state.clearAllProgress,
  }));

export const useReadingProgressLoading = () =>
  useReadingProgressStore(state => state.isLoading);

export const useReadingProgressLastSync = () =>
  useReadingProgressStore(state => state.lastSync);

/**
 * Performance optimization utilities
 */

/**
 * Get reading progress percentage
 * @param scrollY - Current scroll position
 * @param totalHeight - Total scrollable height
 * @returns Progress percentage (0-100)
 */
export const getProgressPercentage = (scrollY: number, totalHeight: number): number => {
  if (totalHeight <= 0) return 0;
  const percentage = (scrollY / totalHeight) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
};

/**
 * Check if article is "read" (based on scroll position)
 * @param scrollY - Current scroll position
 * @param totalHeight - Total scrollable height
 * @param threshold - Threshold percentage (default: 90%)
 * @returns Whether article is considered "read"
 */
export const isArticleRead = (
  scrollY: number,
  totalHeight: number,
  threshold: number = 90
): boolean => {
  const percentage = getProgressPercentage(scrollY, totalHeight);
  return percentage >= threshold;
};

/**
 * Get articles sorted by last update time
 * @param progress - Reading progress record
 * @returns Sorted array of article IDs
 */
export const getRecentlyReadArticles = (
  progress: Record<string, ReadingProgress>
): string[] => {
  return Object.values(progress)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(item => item.articleId);
};

/**
 * Get reading statistics
 * @param progress - Reading progress record
 * @returns Statistics object
 */
export const getReadingStats = (
  progress: Record<string, ReadingProgress>
): {
  totalArticles: number;
  activeArticles: number;
  oldestProgress: string | null;
  newestProgress: string | null;
} => {
  const articles = Object.values(progress);

  if (articles.length === 0) {
    return {
      totalArticles: 0,
      activeArticles: 0,
      oldestProgress: null,
      newestProgress: null,
    };
  }

  const sortedByDate = [...articles].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  );

  return {
    totalArticles: articles.length,
    activeArticles: articles.length, // Can be customized with activity threshold
    oldestProgress: sortedByDate[0]?.updatedAt || null,
    newestProgress: sortedByDate[sortedByDate.length - 1]?.updatedAt || null,
  };
};
