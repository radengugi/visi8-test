/**
 * Babel Configuration untuk Jest
 *
 * Penjelasan untuk interview:
 * - presets: babel-preset-expo sudah include semua yang dibutuhkan:
 *   - TypeScript support
 *   - React Native support
 *   - Modern JS features
 *   - Class properties, private methods, etc.
 * - Kita TIDAK perlu tambahan plugins manual karena expo preset sudah handle
 * - Menambahkan plugins manual bisa cause conflict (loose mode mismatch)
 */
module.exports = {
  presets: ['babel-preset-expo'],
};
