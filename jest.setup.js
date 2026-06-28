/**
 * Jest Setup File
 *
 * Penjelasan untuk interview:
 * - File ini dijalankan SEBELUM semua test
 * - Digunakan untuk setup global mocks dan configurations
 * - AsyncStorage mock didefinisikan di sini karena digunakan di banyak tempat
 * - Mock harus complete dengan resolved values agar Zustand persist bekerja
 */

// Mock AsyncStorage globally dengan implementation yang complete
jest.mock('@react-native-async-storage/async-storage', () => {
  const AsyncStorage = {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  };

  // Return both default dan named exports (some imports might use named)
  return {
    default: AsyncStorage,
    ...AsyncStorage,
  };
});

// Suppress console.log optional (uncomment jika test output terlalu noisy)
// global.console = {
//   ...console,
//   log: jest.fn(),
// };
