import { buildArticleImageUrl } from '../services/article-detail.service';

describe('buildArticleImageUrl', () => {
  it('should return empty string when path is empty', () => {
    const emptyPath = '';
    const result = buildArticleImageUrl(emptyPath);
    expect(result).toBe('');
  });

  it('should return the same URL if path already starts with http', () => {
    const fullUrl = 'https://example.com/image.jpg';
    const anotherUrl = 'http://cdn.images.com/banner.png';

    const result1 = buildArticleImageUrl(fullUrl);
    const result2 = buildArticleImageUrl(anotherUrl);

    expect(result1).toBe(fullUrl);
    expect(result2).toBe(anotherUrl);
  });

  it('should build correct URL for relative path with ../', () => {
    const relativePath = '../images/article-cover.jpg';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';
    const result = buildArticleImageUrl(relativePath);

    expect(result).toBe(`${baseUrl}/images/article-cover.jpg`);
  });

  it('should build correct URL for relative path with ./', () => {
    const relativePath = './images/banner.png';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';
    const result = buildArticleImageUrl(relativePath);

    expect(result).toBe(`${baseUrl}/images/banner.png`);
  });

  it('should build correct URL for relative path without prefix', () => {
    const relativePath = '/uploads/thumb.jpg';
    const baseUrl = 'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';
    const result = buildArticleImageUrl(relativePath);

    expect(result).toBe(`${baseUrl}/uploads/thumb.jpg`);
  });

  it('should produce consistent result for multiple calls with same input', () => {
    const path = '../images/test.jpg';

    const result1 = buildArticleImageUrl(path);
    const result2 = buildArticleImageUrl(path);
    const result3 = buildArticleImageUrl(path);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });
});
