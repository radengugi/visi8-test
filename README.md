# Visi8 Technical Test

A React Native application built with Expo that demonstrates authentication, article browsing, markdown rendering, reading progress persistence, and unit testing.

---

# Features

- Authentication with persistent session
- Article list with infinite scrolling
- Article detail page
- Markdown rendering
- Reading progress persistence
- Automatic scroll position restoration
- Error, loading, and empty states
- Jest unit testing

---

# Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Mobile Framework |
| Expo SDK 53 | Development Platform |
| Expo Router | File-based Navigation |
| TypeScript | Type Safety |
| Zustand | Global State Management |
| TanStack Query | Server State & Cache |
| Axios | HTTP Client |
| AsyncStorage | Local Persistence |
| react-native-markdown-display | Markdown Rendering |
| Jest | Unit Testing |

---

# Project Structure

```
src
├── app
├── components
├── hooks
├── providers
├── services
├── stores
├── types
└── __tests__
```

---

# Application Flow

```
Login
   │
   ▼
Article List
   │
   ▼
Article Detail
   │
   ▼
Save Reading Progress
   │
   ▼
Back to List
   │
   ▼
Open Article Again
   │
   ▼
Restore Previous Position
```

---

# Installation

Install dependencies

```bash
yarn
```

Run Expo

```bash
yarn start
```

Run Android

```bash
yarn android
```

Run iOS

```bash
yarn ios
```

Run Unit Test

```bash
yarn test
```

Generate Coverage

```bash
yarn test --coverage
```

---

# Technical Decisions

## Expo Router

Chosen because it provides simple file-based routing, built-in deep linking support, and integrates naturally with the Expo ecosystem.

## Zustand

Used for lightweight global state management. Combined with Persist middleware to automatically synchronize state into AsyncStorage.

## TanStack Query

Used to manage server state, caching, loading state, retry mechanism, and automatic refetching.

## AsyncStorage

Used for persistent local storage to save authentication session and article reading progress.

---

# Reading Progress

Reading progress is implemented using Zustand with Persist middleware.

Flow:

```
Scroll
    │
    ▼
Debounce
    │
    ▼
Zustand Store
    │
    ▼
AsyncStorage
```

When the user opens the same article again, the stored scroll position is restored automatically.

---

# Testing

The project includes two Jest test suites.

## 1. Article Helper

Tests the `buildArticleImageUrl()` helper.

Covered cases:

- empty path
- relative path
- absolute URL
- path normalization

---

## 2. Reading Progress Store

Tests the reading progress implementation.

Covered cases:

- save progress
- restore progress
- clear progress
- multiple articles
- rapid updates (race condition)
- persistence behavior

The race condition test validates that multiple rapid updates preserve the latest scroll position correctly.

---

# Test Result

```
PASS src/__tests__/reading-progress.store.test.ts

PASS src/__tests__/article-detail-helper.test.ts

Test Suites: 2 passed
Tests: 14 passed
```

---

# Requirement Checklist

| Requirement | Status |
|------------|--------|
| Authentication | ✅ |
| Article List | ✅ |
| Infinite Scroll | ✅ |
| Article Detail | ✅ |
| Markdown Rendering | ✅ |
| Reading Progress | ✅ |
| Restore Reading Progress | ✅ |
| Jest Unit Test | ✅ |
| Race Condition Test | ✅ |

---

# API Source

Mock backend:

https://github.com/visi8-ppramesi/visi8-interview-mock-backend

---

# Assumptions

- Backend is read-only.
- Authentication uses provided mock API.
- Reading progress stores only scroll position.
- Bookmark functionality is outside the current scope.

---

# AI Usage

AI assistance used during development is documented in:

```
AI_NOTES.md
```

---

# License

This repository was created solely for the Visi8 Technical Test.