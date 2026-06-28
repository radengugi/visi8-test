# 🧪 Quick Test Guide

## Install Dependencies

```bash
npm install --save-dev @babel/plugin-proposal-private-methods @babel/preset-env @babel/preset-typescript @react-native/jest-preset @types/jest babel-jest jest
```

Or with yarn:
```bash
yarn add -D @babel/plugin-proposal-private-methods @babel/preset-env @babel/preset-typescript @react-native/jest-preset @types/jest babel-jest jest
```

## Run Tests

```bash
# All tests
npm test
# or
yarn test

# Single file
npm test article-detail-helper
# or
yarn test article-detail-helper

# Watch mode
npm test -- --watch
# or
yarn test --watch

# Coverage
npm test -- --coverage
# or
yarn test --coverage

# Verbose
npm test -- --verbose
# or
yarn test --verbose
```

## Test Files

- `src/__tests__/article-detail-helper.test.ts` - 6 tests
- `src/__tests__/reading-progress.store.test.ts` - 8 tests

## Total: 14 Test Cases

See `UNIT_TEST_SETUP.md` for detailed explanation.
