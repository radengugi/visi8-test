/**
 * Reading Progress Hook with Optimized Scroll Handling
 *
 * Features:
 * - Proper 500ms debounce using useRef
 * - Single-time restore with flag to prevent loops
 * - Auto-save on unmount
 * - No re-renders on scroll events
 * - Memory leak safe
 * - Production ready
 */

import { useCallback, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useReadingProgressStore } from '@/stores/reading-progress.store';

export interface UseReadingProgressWithScrollProps {
  articleId: string | undefined;
  scrollViewRef: React.RefObject<ScrollView | null>;
  initialScrollY: number;
}

/**
 * Hook untuk menghandle scroll event dengan proper debounce
 * dan auto-save on unmount
 */
export const useReadingProgressWithScroll = ({
  articleId,
  scrollViewRef,
  initialScrollY,
}: UseReadingProgressWithScrollProps) => {
  const setProgress = useReadingProgressStore((state) => state.setProgress);

  // Flag untuk memastikan restore hanya sekali
  const hasRestored = useRef(false);

  // Timer untuk debounce (gunakan useRef agar tidak trigger re-render)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track posisi scroll terakhir untuk save on unmount
  const lastScrollYRef = useRef(0);

  /**
   * Debounced scroll handler
   *
   * Menggunakan useRef untuk timer agar:
   * 1. Tidak trigger re-render setiap scroll
   * 2. Timer persist antar scroll events
   */
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const scrollY = event.nativeEvent.contentOffset.y;

      // Update last scroll position untuk unmount save
      lastScrollYRef.current = scrollY;

      // Clear existing timer
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timer - save after 500ms of no scroll
      scrollTimeoutRef.current = setTimeout(() => {
        if (articleId && typeof scrollY === 'number' && scrollY >= 0) {
          setProgress(articleId, scrollY);
        }
        scrollTimeoutRef.current = null;
      }, 500);
    },
    [articleId, setProgress]
  );

  /**
   * Restore scroll position hanya sekali setelah article dimuat
   *
   * Menggunakan hasRestored flag untuk:
   * 1. Mencegah infinite loop
   * 2. Mencegah race condition
   * 3. Ensure restore hanya terjadi sekali per mount
   */
  useEffect(() => {
    // Skip jika:
    // - Article ID tidak valid
    // - Sudah pernah restore
    // - Initial scroll tidak valid
    // - ScrollView belum ready
    if (
      !articleId ||
      hasRestored.current ||
      !initialScrollY ||
      initialScrollY <= 0 ||
      !scrollViewRef.current
    ) {
      return;
    }

    // Restore scroll position
    // Menggunakan scrollTo untuk set position secara manual
    try {
      scrollViewRef.current.scrollTo({
        y: initialScrollY,
        animated: false, // Important: no animation untuk prevent visual glitch
      });
      hasRestored.current = true;
    } catch (error) {
      console.warn('[ReadingProgress] Failed to restore scroll position:', error);
      hasRestored.current = true; // Mark as restored to prevent retries
    }
  }, [articleId, initialScrollY, scrollViewRef]);

  /**
   * Cleanup on unmount
   *
   * 1. Clear pending debounce timer
   * 2. Save last scroll position
   *
   * Ini mencegah:
   * - Memory leak dari timer yang tidak cleared
   * - Lost progress pada quick unmount
   */
  useEffect(() => {
    return () => {
      // Clear pending timer
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      // Save last scroll position immediately on unmount
      if (articleId && lastScrollYRef.current > 0) {
        setProgress(articleId, lastScrollYRef.current);
      }
    };
  }, [articleId, setProgress]);

  return {
    handleScroll,
  };
};
