import { useReadingProgressStore } from '@/stores/reading-progress.store';
import { useCallback } from 'react';

export const useReadingProgress = (
  articleId: string
) => {
  const progress =
    useReadingProgressStore(
      (state) =>
        state.progress[articleId] ?? 0
    );

  const setProgress =
    useReadingProgressStore(
      (state) => state.setProgress
    );

  const clearProgress =
    useReadingProgressStore(
      (state) => state.clearProgress
    );

  const saveProgress = useCallback(
    (scrollY: number) => {
      setProgress(
        articleId,
        scrollY
      );
    },
    [articleId, setProgress]
  );

  const removeProgress =
    useCallback(() => {
      clearProgress(articleId);
    }, [articleId, clearProgress]);

  return {
    progress,
    saveProgress,
    clearProgress:
      removeProgress,
  };
};