# Visi8 Technical Test

A React Native mobile application with article reading features, authentication, and reading progress persistence.

## Features

- Authentication with session persistence
- Article list with infinite scroll
- Article detail with markdown rendering
- Reading progress persistence and restoration
- Unit testing with race condition validation

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Mobile Framework |
| Expo SDK 56 | Development Platform |
| Expo Router | Navigation |
| TypeScript | Type Safety |
| Zustand | State Management |
| TanStack Query | Server State |
| Axios | HTTP Client |
| AsyncStorage | Local Persistence |
| react-native-markdown-display | Markdown Rendering |
| Jest | Unit Testing |

## Environment

- Node.js >= 20
- Yarn 1.x
- Expo SDK 56
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Features

- Authentication
- Session Persistence
- Article List
- Infinite Scroll
- Pagination
- Loading State
- Empty State
- Error State
- Retry Mechanism
- Markdown Rendering
- Reading Progress
- Persist Reading Progress
- Restore Reading Progress

## Application Flow

```
Login
  ↓
Article List
  ↓
Tap Article
  ↓
Article Detail
  ↓
Reading Progress Saved
  ↓
Back to List
  ↓
Open Article Again
  ↓
Reading Position Restored
```

## Folder Structure

```
src
├── app              # Expo Router screens and navigation
├── components       # Reusable UI components
├── hooks           # Custom React hooks
├── providers       # React context providers
├── services        # API services and data fetching
├── stores         # Zustand global state
├── types          # TypeScript type definitions
└── __tests__      # Unit tests
```

## Architecture

### Data Flow

```
UI
  ↓
Hooks
  ↓
Services
  ↓
API
```

### Global State

```
Zustand Stores
  ↓
AsyncStorage (Persist Middleware)
```

Global state uses Zustand with persist middleware to automatically sync state changes to AsyncStorage, providing offline persistence and state restoration on app restart.

## API Source

This project uses a mock backend hosted on GitHub:

```
https://github.com/visi8-ppramesi/visi8-interview-mock-backend
```

Data sources:
- `articles.json` - Article list metadata
- Individual article JSON files - Article details and content
- Image assets hosted in the repository

## Technical Decisions

### Expo Router

Chosen for file-based routing system that simplifies navigation configuration. Deep linking support is built-in, and it integrates seamlessly with Expo ecosystem.

### Zustand

Lightweight state management solution with minimal boilerplate. The persist middleware provides automatic AsyncStorage synchronization without additional setup. Better performance compared to Context API due to selective re-renders.

### TanStack Query

Handles server state with automatic caching, refetching, and background updates. Reduces boilerplate for loading/error states and provides built-in retry mechanisms. Better user experience with stale data management.

### Axios

HTTP client with interceptors support and better error handling. Consistent API for request/response transformation and timeout configuration. Widely adopted in React Native ecosystem.

### AsyncStorage

Chosen for persistent storage solution with async operations. Reliable cross-platform storage with good performance for reading progress data. Native implementation provides better performance than alternatives.

## Performance Optimizations

- React Query cache with automatic refetching
- FlatList virtualization for long lists
- useCallback for event handlers
- expo-image built-in cache
- Debounced reading progress updates
- Zustand selector optimization
- Minimal re-render patterns

## Reading Progress

Reading progress system tracks scroll position for each article:

- Scroll position stored in AsyncStorage through Zustand persist middleware
- Progress automatically restored when article is reopened
- Debounced updates to reduce storage write operations
- Multiple rapid updates handled correctly with final value preserved

The store uses Zustand's atomic state updates, ensuring that rapid scroll events don't cause race conditions or data loss.

## Error Handling

- Loading state during data fetching
- Empty state when no data available
- Error state with user-friendly messages
- Retry button for failed requests
- API error handling with axios interceptors
- Boundary error handling in components

## Unit Testing

Project uses Jest for unit testing with two test suites:

### Test 1: Article Helper

Tests `buildArticleImageUrl()` function that constructs complete URLs from relative paths.

**Coverage:**
- Empty string handling
- Absolute URL passthrough
- Relative path normalization with `../`
- Relative path normalization with `./`
- Path concatenation

### Test 2: Reading Progress Store

Tests race condition handling in reading progress persistence.

**Coverage:**
- Single update baseline
- Multiple rapid updates (requirement validation)
- Multiple articles simultaneous updates
- Stress test with 100 updates
- AsyncStorage persistence integration
- State consistency across API surface

### Test Results

```
PASS src/__tests__/reading-progress.store.test.ts
  ✓ 8 tests passed

PASS src/__tests__/article-detail-helper.test.ts
  ✓ 6 tests passed

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Time:        0.3s
```

### Run Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test article-detail-helper

# Generate coverage report
yarn test --coverage

# Watch mode for development
yarn test --watch
```

## Coverage

Coverage report generated using:

```bash
yarn test --coverage
```

Coverage report focuses on test presence and requirement fulfillment rather than percentage metrics.

## Requirement Checklist

| Requirement | Status |
|-------------|--------|
| Authentication | ✅ |
| Session Persistence | ✅ |
| Article List | ✅ |
| Infinite Scroll | ✅ |
| Pagination | ✅ |
| Article Detail | ✅ |
| Markdown Rendering | ✅ |
| Reading Progress | ✅ |
| Restore Reading Progress | ✅ |
| Unit Test | ✅ |
| Race Condition Test | ✅ |

## Assumptions

- Backend API is read-only for this implementation
- Authentication uses mock API endpoints
- Reading progress stores only scroll position
- Bookmark feature is out of scope
- Article editing is not supported
- Network connectivity is required for initial load

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Relative image paths in markdown | `buildArticleImageUrl()` helper function |
| Reading progress persistence | Zustand with persist middleware |
| Multiple rapid scroll updates | Atomic state updates with race condition tests |
| Markdown rendering with images | react-native-markdown-display with custom image URL builder |
| Infinite scroll state management | TanStack Query with pagination |
| Session persistence | AsyncStorage with Zustand persist |

## Installation

```bash
# Install dependencies
yarn

# Start development server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios

# Run tests
yarn test
```

**Command explanations:**
- `yarn` - Installs all project dependencies
- `yarn start` - Starts Expo development server
- `yarn android` - Builds and runs on Android emulator/device
- `yarn ios` - Builds and runs on iOS simulator/device
- `yarn test` - Runs all unit tests

## Project Structure Details

### `src/app/`
Expo Router file-based navigation system. Each file represents a route in the application.

### `src/components/`
Reusable React components that can be used across different screens.

### `src/hooks/`
Custom React hooks for reusable stateful logic and side effects.

### `src/providers/`
React context providers that wrap the application root.

### `src/services/`
API communication layer and data fetching logic.

### `src/stores/`
Zustand stores for global state management with persistence.

### `src/types/`
TypeScript type definitions and interfaces.

### `src/__tests__/`
Unit test files organized by feature.

## License

This project is submitted as a technical test and is intended for evaluation purposes only.
