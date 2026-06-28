/**
 * Jest Configuration untuk React Native Expo + TypeScript
 *
 * Penjelasan setup untuk interview:
 * - Manual configuration tanpa preset (lebih reliable dan tidak ada dependency issues)
 * - Kita define semua configuration yang dibutuhkan secara manual
 * - Ini approach yang lebih robust untuk Expo projects
 * - setupFiles → setup global mocks sebelum test jalan
 * - setupFilesAfterEnv → setup setelah environment siap
 * - moduleNameMapper → alias untuk mocks (assets, images)
 * - testMatch → pattern untuk mencari file test
 * - collectCoverageFrom → file yang di-include untuk coverage report
 *
 * Kenapa manual config:
 * - Menghindari dependency version conflicts
 * - Lebih kontrol atas configuration
 * - Tidak tergantung pada preset yang bisa berubah
 */
module.exports = {
  // Test environment - gunakan node environment untuk stability
  testEnvironment: 'node',

  // Setup files - dijalankan sebelum test suite
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Transform configuration untuk TypeScript dan JSX
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },

  // Transform ignore patterns - penting untuk Expo modules
  // JANGAN ignore Expo modules atau akan error "invariant"
  transformIgnorePatterns: [
    'node_modules/(?!(?:.+?/)(?:expo|expo-modules|react-native|@react-native|react-native-web|@react-navigation|@expo|expo-router|zustand|axios)/)',
  ],

  // Module name mapper untuk mocks
  moduleNameMapper: {
    // Mock image files
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/assetMock.js',
  },

  // Pattern untuk mencari file test
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
  ],

  // Ignore patterns untuk test paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/',
  ],

  // Module directories
  moduleDirectories: ['node_modules', 'src'],

  // Reset mocks sebelum tiap test
  clearMocks: true,
  resetModules: true,

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
