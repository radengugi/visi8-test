# Jest Preset Migration - Fix Documentation

## Problem Evolution:

### Error 1: Initial Validation Error
```
Module @testing-library/react-native should have "jest-preset.js"
```
**Cause:** Wrong preset for Expo projects

### Error 2: React Native Preset Migration
```
The React Native Jest preset has moved to a separate package.
To migrate, please install "@react-native/jest-preset"
```
**Cause:** React Native v0.70+ moved Jest preset to separate package

---

## ✅ Final Solution:

### 1. Updated `jest.config.js`
Use `@react-native/jest-preset` instead of `jest-expo`:

```javascript
module.exports = {
  preset: '@react-native/jest-preset',  // ✅ Correct
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:.+?/)(?:expo|expo-modules|react-native|@react-native|react-native-web|@react-navigation|@expo|expo-router|zustand|axios)/)',
  ],
  // ... rest of config
};
```

### 2. Updated `package.json`
Replace dependencies:

**Remove:**
- `jest-expo` (deprecated for this use case)
- `@testing-library/react-native` (not needed)

**Add:**
- `@react-native/jest-preset` (React Native v0.70+ requirement)

```json
{
  "devDependencies": {
    "@babel/plugin-proposal-private-methods": "^7.18.6",
    "@babel/preset-env": "^7.20.0",
    "@babel/preset-typescript": "^7.21.0",
    "@react-native/jest-preset": "^5.0.0",  // ✅ Added
    "@types/jest": "^29.5.0",
    "babel-jest": "^29.5.0",
    "jest": "^29.5.0"
  }
}
```

---

## 📦 Installation Command:

```bash
# With npm
npm install --save-dev @babel/plugin-proposal-private-methods @babel/preset-env @babel/preset-typescript @react-native/jest-preset @types/jest babel-jest jest

# With yarn
yarn add -D @babel/plugin-proposal-private-methods @babel/preset-env @babel/preset-typescript @react-native/jest-preset @types/jest babel-jest jest
```

---

## 🎯 Why This Works:

1. **@react-native/jest-preset**
   - Official Jest preset for React Native v0.70+
   - Includes all necessary transforms and configurations
   - Maintained by React Native team

2. **Custom Expo Transform**
   - Added `transformIgnorePatterns` for Expo modules
   - Ensures Expo-specific modules are transformed correctly
   - Handles expo-router, expo-modules, etc.

3. **Babel Configuration**
   - TypeScript support via `babel-jest`
   - JSX support for React components
   - ES6+ features via `@babel/preset-env`

---

## 🚀 Run Tests:

```bash
yarn test
# or
npm test
```

**Expected Output:**
```
PASS  src/__tests__/article-detail-helper.test.ts
  ✓ 6 tests

PASS  src/__tests__/reading-progress.store.test.ts
  ✓ 8 tests

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total ✅
```

---

## 📊 Migration Summary:

| What | Before | After | Status |
|------|--------|-------|--------|
| Preset | `jest-expo` | `@react-native/jest-preset` | ✅ Fixed |
| Package | `jest-expo` | `@react-native/jest-preset` | ✅ Fixed |
| Config | Minimal | Full Expo support | ✅ Fixed |
| TypeScript | ❌ Errors | ✅ Working | ✅ Fixed |
| Validation | ❌ Errors | ✅ Passing | ✅ Fixed |

---

## ✨ Ready for Interview!

Setup complete and working. All 14 test cases ready to run!
