import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReadingProgressStore } from '../stores/reading-progress.store';

const resetStore = () => {
  useReadingProgressStore.setState({
    progress: {},
  });

  jest.clearAllMocks();

  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
};

describe('Reading Progress Store - Race Condition Test', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should save progress correctly for single update', () => {
    const articleId = 'news-001';
    const scrollY = 100;

    useReadingProgressStore.getState().setProgress(articleId, scrollY);

    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(100);
  });

  it('should handle multiple rapid setProgress calls correctly (NO RACE CONDITION)', () => {
    const articleId = 'news-001';

    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 120);
    useReadingProgressStore.getState().setProgress(articleId, 150);
    useReadingProgressStore.getState().setProgress(articleId, 200);
    useReadingProgressStore.getState().setProgress(articleId, 250);

    const result = useReadingProgressStore.getState().getProgress(articleId);

    expect(result).toBe(250);
    expect(result).not.toBe(100);
    expect(result).not.toBe(150);
  });

  it('should handle rapid updates for different articles simultaneously', () => {
    const article1 = 'news-001';
    const article2 = 'news-002';
    const article3 = 'news-003';

    useReadingProgressStore.getState().setProgress(article1, 100);
    useReadingProgressStore.getState().setProgress(article2, 50);
    useReadingProgressStore.getState().setProgress(article1, 150);
    useReadingProgressStore.getState().setProgress(article3, 75);
    useReadingProgressStore.getState().setProgress(article2, 100);

    expect(useReadingProgressStore.getState().getProgress(article1)).toBe(150);
    expect(useReadingProgressStore.getState().getProgress(article2)).toBe(100);
    expect(useReadingProgressStore.getState().getProgress(article3)).toBe(75);
  });

  it('should handle 100 rapid updates without losing progress', () => {
    const articleId = 'news-004';
    const finalValue = 5000;

    for (let i = 0; i <= 100; i++) {
      useReadingProgressStore.getState().setProgress(articleId, i * 50);
    }

    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(finalValue);
  });

  it('should handle rapid updates even with AsyncStorage persistence', async () => {
    const articleId = 'news-005';

    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 150);
    useReadingProgressStore.getState().setProgress(articleId, 200);

    const result = useReadingProgressStore.getState().getProgress(articleId);
    expect(result).toBe(200);
  });

  it('should return true for hasProgress after rapid updates', () => {
    const articleId = 'news-006';

    useReadingProgressStore.getState().setProgress(articleId, 50);
    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 150);

    expect(useReadingProgressStore.getState().hasProgress(articleId)).toBe(true);
    expect(useReadingProgressStore.getState().getProgress(articleId)).toBe(150);
  });

  it('should clear progress correctly after rapid updates', () => {
    const articleId = 'news-007';

    useReadingProgressStore.getState().setProgress(articleId, 100);
    useReadingProgressStore.getState().setProgress(articleId, 200);
    useReadingProgressStore.getState().setProgress(articleId, 300);
    useReadingProgressStore.getState().clearProgress(articleId);

    expect(useReadingProgressStore.getState().hasProgress(articleId)).toBe(false);
    expect(useReadingProgressStore.getState().getProgress(articleId)).toBe(0);
  });

  it('should not affect other articles when updating one article rapidly', () => {
    const articleA = 'news-008';
    const articleB = 'news-009';

    useReadingProgressStore.getState().setProgress(articleA, 100);
    useReadingProgressStore.getState().setProgress(articleB, 500);

    useReadingProgressStore.getState().setProgress(articleA, 150);
    useReadingProgressStore.getState().setProgress(articleA, 200);
    useReadingProgressStore.getState().setProgress(articleA, 250);

    expect(useReadingProgressStore.getState().getProgress(articleA)).toBe(250);
    expect(useReadingProgressStore.getState().getProgress(articleB)).toBe(500);
  });
});
