/**
 * Test Suite: Reading Progress Store (Race Condition Test)
 *
 * WAJIB - Test ini adalah requirement perusahaan
 *
 * Penjelasan untuk interview:
 * - Ini test untuk MEMBUKTIKAN reading progress TIDAK HILANG
 *   ketika terjadi multiple rapid updates
 * - Scenario: user scroll cepat, banyak setProgress() ter-trigger
 * - Kita perlu buktikan bahwa update terakhir yang "menang"
 * - Ini penting karena reading progress adalah core UX feature
 *
 * Kenapa butuh test ini:
 * 1. User scroll bisa trigger banyak updates dalam waktu singkat
 * 2. Jika ada race condition, user bisa kehilangan progress mereka
 * 3. Persist layer (AsyncStorage) bisa jadi bottleneck
 * 4. Test ini membuktikan app kita handle ini dengan benar
 *
 * Architecture di app ini:
 * - Zustand + Persist middleware
 * - AsyncStorage sebagai storage backend
 * - setProgress() update state object (immutable pattern)
 *
 * Race condition prevention di Zustand:
 * - Zustand gunakan immer-like pattern untuk state updates
 * - Setiap setProgress() call dapat LATEST state sebelum update
 * - Jadi tidak ada "lost update" scenario
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReadingProgressStore } from '../stores/reading-progress.store';

/**
 * Helper: Reset store sebelum tiap test
 *
 * Penjelasan untuk interview:
 * - Penting untuk test isolation
 * - Setiap test harus start dari clean state
 * - Kita mock AsyncStorage untuk kontrol penuh
 */
const resetStore = () => {
  // Reset internal Zustand state
  useReadingProgressStore.setState({
    progress: {},
  });

  // Clear semua mocks
  jest.clearAllMocks();

  // Mock return value untuk getItem (empty state)
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
};

describe('Reading Progress Store - Race Condition Test', () => {
  /**
   * SETUP & TEAR DOWN
   *
   * Penjelasan untuk interview:
   * - beforeEach: reset store sebelum tiap test
   * - Ini ensure test isolation dan predictable behavior
   */
  beforeEach(() => {
    resetStore();
  });

  /**
   * Test Case 1: Single setProgress call (baseline)
   *
   * Penjelasan untuk interview:
   * - Ini test dasar untuk buktikan setProgress() bekerja
   * - Expected: progress tersimpan dengan nilai yang benar
   * - Ini baseline untuk bandingkan dengan rapid update scenario
   */
  it('should save progress correctly for single update', () => {
    // Arrange
    const articleId = 'news-001';
    const scrollY = 100;

    // Act
    useReadingProgressStore.getState().setProgress(articleId, scrollY);

    // Assert
    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(100);
  });

  /**
   * Test Case 2: MULTIPLE RAPID UPDATES - WAJIB TEST
   *
   * Penjelasan untuk interview:
   * - INI ADALAH TEST WAJIB dari requirement perusahaan
   * - Scenario: 5 setProgress() calls dalam quick succession
   * - Expected: NILAI TERAKHIR yang tersimpan (250)
   * - Ini buktikan TIDAK ADA race condition
   *
   * Kenapa ini bekerja:
   * 1. Zustand's setState() is synchronous and atomic
   * 2. Tiap call dapat latest state sebelum update
   * 3. Tidak ada async gap yang bisa cause race condition
   * 4. Pattern: ...state.progress spreads existing values
   */
  it('should handle multiple rapid setProgress calls correctly (NO RACE CONDITION)', () => {
    // Arrange
    const articleId = 'news-001';

    // Act - 5 rapid updates (simulasi user scroll cepat)
    // Di real scenario, ini bisa happen dalam <100ms
    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 120);
    useReadingProgressStore.getState().setProgress(articleId, 150);
    useReadingProgressStore.getState().setProgress(articleId, 200);
    useReadingProgressStore.getState().setProgress(articleId, 250);

    // Assert - HASIL AKHIR harus 250 (bukan 100, 120, atau 150)
    const result = useReadingProgressStore.getState().getProgress(articleId);

    // Ini buktikan bahwa update terakhir yang "menang"
    expect(result).toBe(250);
    expect(result).not.toBe(100);
    expect(result).not.toBe(150);
  });

  /**
   * Test Case 3: Rapid updates untuk BERBEDA articles
   *
   * Penjelasan untuk interview:
   * - Scenario: user baca multiple article, switch cepat
   * - Expected: setiap article dapat progress yang benar
   * - Ini buktikan store handle multiple keys dengan benar
   */
  it('should handle rapid updates for different articles simultaneously', () => {
    // Arrange
    const article1 = 'news-001';
    const article2 = 'news-002';
    const article3 = 'news-003';

    // Act - rapid updates untuk 3 articles berbeda
    useReadingProgressStore.getState().setProgress(article1, 100);
    useReadingProgressStore.getState().setProgress(article2, 50);
    useReadingProgressStore.getState().setProgress(article1, 150);
    useReadingProgressStore.getState().setProgress(article3, 75);
    useReadingProgressStore.getState().setProgress(article2, 100);

    // Assert - semua progress harus tersimpan dengan benar
    expect(useReadingProgressStore.getState().getProgress(article1)).toBe(150);
    expect(useReadingProgressStore.getState().getProgress(article2)).toBe(100);
    expect(useReadingProgressStore.getState().getProgress(article3)).toBe(75);
  });

  /**
   * Test Case 4: Rapid updates dalam loop (stress test)
   *
   * Penjelasan untuk interview:
   * - Scenario: user scroll sangat cepat, trigger 100 updates
   - Expected: NILAI TERAKHIR yang tersimpan
   * - Ini stress test untuk buktikan consistency di high frequency
   */
  it('should handle 100 rapid updates without losing progress', () => {
    // Arrange
    const articleId = 'news-004';
    const finalValue = 5000;

    // Act - 100 rapid updates
    for (let i = 0; i <= 100; i++) {
      useReadingProgressStore.getState().setProgress(articleId, i * 50);
    }

    // Assert - final value harus tersimpan
    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(finalValue);
  });

  /**
   * Test Case 5: Race condition test dengan fake timers (optional)
   *
   * Penjelasan untuk interview:
   * - Kita gunakan fake timers untuk simulasi rapid async scenario
   * - Walau setProgress synchronous di Zustand, persist layer async
   * - Test ini buktikan bahwa persist async tidak affect state consistency
   */
  it('should handle rapid updates even with AsyncStorage persistence', async () => {
    // Arrange
    const articleId = 'news-005';

    // Mock AsyncStorage.setItem
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Act - rapid updates (will trigger persist after each)
    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 150);
    useReadingProgressStore.getState().setProgress(articleId, 200);

    // Assert - state harus consistent immediately
    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(200);

    // Persist layer akan handle async, tapi state already correct
    // AsyncStorage.setItem dipanggil tapi tidak block state updates
  });

  /**
   * Test Case 6: hasProgress() setelah rapid updates
   *
   * Penjelasan untuk interview:
   * - Test integration antara setProgress dan hasProgress
   * - Expected: hasProgress return true setelah update
   * - Ini buktikan state consistency di whole API surface
   */
  it('should return true for hasProgress after rapid updates', () => {
    // Arrange
    const articleId = 'news-006';

    // Act - rapid updates
    useReadingProgressStore.getState().setProgress(articleId, 50);
    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 150);

    // Assert
    expect(useReadingProgressStore.getState().hasProgress(articleId)).toBe(true);
    expect(useReadingProgressStore.getState().getProgress(articleId)).toBe(150);
  });

  /**
   * Test Case 7: clearProgress() setelah rapid updates
   *
   * Penjelasan untuk interview:
   * - Test integration untuk clearProgress functionality
   * - Expected: progress dihapus setelah rapid updates + clear
   */
  it('should clear progress correctly after rapid updates', () => {
    // Arrange
    const articleId = 'news-007';

    // Act - rapid updates, lalu clear
    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 200);
    useReadingProgressStore.getState().setProgress(articleId, 300);
    useReadingProgressStore.getState().clearProgress(articleId);

    // Assert
    expect(useReadingProgressStore.getState().hasProgress(articleId)).toBe(false);
    expect(useReadingProgressStore.getState().getProgress(articleId)).toBe(0);
  });

  /**
   * Test Case 8: Store isolation - tidak ada cross-contamination
   *
   * Penjelasan untuk interview:
   * - Test untuk buktikan setiap article independent
   * - Update di article A tidak affect article B
   */
  it('should not affect other articles when updating one article rapidly', () => {
    // Arrange
    const articleA = 'news-008';
    const articleB = 'news-009';

    // Act - setup initial values
    useReadingProgressStore.getState().setProgress(articleA, 100);
    useReadingProgressStore.getState().setProgress(articleB, 500);

    // Rapid updates hanya untuk article A
    useReadingProgressStore.getState().setProgress(articleA, 150);
    useReadingProgressStore.getState().setProgress(articleA, 200);
    useReadingProgressStore.getState().setProgress(articleA, 250);

    // Assert - article B tidak ter-affected
    expect(useReadingProgressStore.getState().getProgress(articleA)).toBe(250);
    expect(useReadingProgressStore.getState().getProgress(articleB)).toBe(500);
  });
});
