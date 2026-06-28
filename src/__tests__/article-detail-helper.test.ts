/**
 * Test Suite: Article Detail Helper Function
 *
 * Penjelasan untuk interview:
 * - Ini adalah test SEDERHANA untuk helper function (pilihan bebas)
 * - Test logic yang murni: input → output, tanpa side effects
 * - Mudah dibaca, mudah dijelaskan, dan sangat bernilai
 * - Fungsi buildArticleImageUrl penting untuk menampilkan gambar artikel
 *
 * Kenapa test ini penting:
 * 1. Gambar adalah core feature di app ini (news app)
 * 2. URL building logic bisa break jika ada perubahan path format
 * 3. Test cheap dan fast, memberikan confidence cepat
 */

import { buildArticleImageUrl } from '../services/article-detail.service';

describe('buildArticleImageUrl', () => {
  /**
   * SETUP
   *
   - Tidak perlu setup khusus karena ini pure function
   - Tidak ada external dependencies
   - Tidak ada async operations
   */

  /**
   * TEAR DOWN
   *
   - Tidak perlu cleanup karena tidak ada side effects
   */

  /**
   * Test Case 1: Handle empty string
   *
   * Penjelasan untuk interview:
   * - Edge case: apa yang terjadi jika path kosong?
   * - Expected: return empty string (defensive programming)
   * - Ini test boundary condition
   */
  it('should return empty string when path is empty', () => {
    // Arrange
    const emptyPath = '';

    // Act
    const result = buildArticleImageUrl(emptyPath);

    // Assert
    expect(result).toBe('');
  });

  /**
   * Test Case 2: Handle absolute URL (http/https)
   *
   * Penjelasan untuk interview:
   * - Normal case: jika path sudah full URL
   * - Expected: return URL as-is (tidak di-modify)
   * - Ini test untuk prevent double URL concatenation
   */
  it('should return the same URL if path already starts with http', () => {
    // Arrange
    const fullUrl = 'https://example.com/image.jpg';
    const anotherUrl = 'http://cdn.images.com/banner.png';

    // Act
    const result1 = buildArticleImageUrl(fullUrl);
    const result2 = buildArticleImageUrl(anotherUrl);

    // Assert
    expect(result1).toBe(fullUrl);
    expect(result2).toBe(anotherUrl);
  });

  /**
   * Test Case 3: Handle relative path with ../
   *
   * Penjelasan untuk interview:
   * - Real case: path bisa berformat '../images/pic.jpg'
   * - Expected: normalize ke '/images/pic.jpg' lalu concat dengan base URL
   * - Ini test untuk path normalization logic
   */
  it('should build correct URL for relative path with ../', () => {
    // Arrange
    const relativePath = '../images/article-cover.jpg';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';

    // Act
    const result = buildArticleImageUrl(relativePath);

    // Assert
    expect(result).toBe(`${baseUrl}/images/article-cover.jpg`);
  });

  /**
   * Test Case 4: Handle relative path with ./
   *
   * Penjelasan untuk interview:
   * - Real case: path bisa berformat './images/pic.jpg'
   * - Expected: normalize ke '/images/pic.jpg' lalu concat dengan base URL
   */
  it('should build correct URL for relative path with ./', () => {
    // Arrange
    const relativePath = './images/banner.png';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';

    // Act
    const result = buildArticleImageUrl(relativePath);

    // Assert
    expect(result).toBe(`${baseUrl}/images/banner.png`);
  });

  /**
   * Test Case 5: Handle relative path without prefix
   *
   * Penjelasan untuk interview:
   * - Real case: path bisa berformat '/images/pic.jpg' atau 'images/pic.jpg'
   * - Expected: concat langsung dengan base URL
   */
  it('should build correct URL for relative path without prefix', () => {
    // Arrange
    const relativePath = '/uploads/thumb.jpg';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';

    // Act
    const result = buildArticleImageUrl(relativePath);

    // Assert
    expect(result).toBe(`${baseUrl}/uploads/thumb.jpg`);
  });

  /**
   * Test Case 6: Multiple consecutive setProgress calls (bonus)
   *
   * Penjelasan untuk interview:
   * - Ini test untuk PROVE bahwa function ini idempotent
   * - Idempotent = hasil selalu sama untuk input yang sama
   * - Penting untuk URL building karena tidak ada state
   */
  it('should produce consistent result for multiple calls with same input', () => {
    // Arrange
    const path = '../images/test.jpg';

    // Act - call multiple times
    const result1 = buildArticleImageUrl(path);
    const result2 = buildArticleImageUrl(path);
    const result3 = buildArticleImageUrl(path);

    // Assert - semua harus sama
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });
});
