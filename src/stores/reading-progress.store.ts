import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ReadingProgressState = {
  progress: Record<string, number>;

  setProgress: (
    articleId: string,
    scrollY: number
  ) => void;

  getProgress: (
    articleId: string
  ) => number;

  clearProgress: (
    articleId: string
  ) => void;

  hasProgress: (articleId: string) => boolean;
};

export const useReadingProgressStore =
  create<ReadingProgressState>()(
    persist(
      (set, get) => ({
        progress: {},

        setProgress: (
          articleId,
          scrollY
        ) =>
          set((state) => ({
            progress: {
              ...state.progress,
              [articleId]: scrollY,
            },
          })),

        getProgress: (
          articleId
        ) =>
          get().progress[
            articleId
          ] ?? 0,

        clearProgress: (
          articleId
        ) =>
          set((state) => {
            const progress = {
              ...state.progress,
            };

            delete progress[
              articleId
            ];

            return { progress };
          }),

        hasProgress: (articleId) => {
          const progress = get().progress[articleId];
          return typeof progress === 'number' && progress > 0;
        },
      }),

      {
        name: 'reading-progress',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );

// Convenience hook for checking if an article has reading progress
export const useHasProgress = (articleId: string) => {
  return useReadingProgressStore((state) => state.hasProgress(articleId));
};
