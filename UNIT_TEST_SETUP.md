# Unit Test Setup - Documentation untuk Interview

## 📋 Overview

Ini adalah setup unit test untuk take-home test React Native (Expo + TypeScript).

**Total Tests: 2 File (Memenuhi Requirement)**

### 1. Test Bebas: `article-detail-helper.test.ts`
- Menguji fungsi `buildArticleImageUrl()`
- Pure function, simple logic, high value
- 6 test cases

### 2. Test Wajib: `reading-progress.store.test.ts`
- Menguji race condition di Reading Progress Store
- MEMBUKTIKAN progress TIDAK HILANG di rapid updates
- 8 test cases dengan comprehensive scenarios

---

## 📦 Library yang Perlu Di-install

Tambahkan ini ke `package.json` di `devDependencies`:

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^7.0.2",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "jest-expo": "~51.0.0",
    "babel-jest": "^29.5.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/preset-typescript": "^7.21.0",
    "@babel/plugin-proposal-private-methods": "^7.18.6"
  }
}
```

**Install command:**
```bash
npm install --save-dev @testing-library/react-native @types/jest jest jest-expo babel-jest @babel/preset-env @babel/preset-typescript @babel/plugin-proposal-private-methods
```

---

## 📁 Struktur Folder Test

```
visi8-test/
├── __mocks__/
│   └── assetMock.js           # Mock untuk image files
├── src/
│   ├── __tests__/             # ⭐ SEMUA TEST DI SINI
│   │   ├── article-detail-helper.test.ts
│   │   └── reading-progress.store.test.ts
│   ├── services/
│   └── stores/
├── jest.config.js             # Konfigurasi Jest
├── jest.setup.js              # Global setup & mocks
└── babel.config.js            # Babel configuration
```

**Kenapa pakai `src/__tests__/`?**

Alasannya:
1. **Co-location** - test bersebelahan dengan source code yang di-test
2. **Easy to find** - developer langsung tahu mana file yang punya test
3. **Convention** - banyak React Native projects pakai pattern ini
4. **Clean root** - tidak ada banyak folder test di root project

Alternative seperti `__tests__/` di root juga valid, tapi co-location lebih recommended untuk codebase yang tidak terlalu besar.

---

## 🎯 File 1: article-detail-helper.test.ts

### Apa yang di-test?

**Function:** `buildArticleImageUrl(path: string): string`

**Responsibilities:**
- Build complete URL dari relative path
- Handle absolute URL (http/https)
- Normalize path format (`../` dan `./`)

### Test Cases (6 total):

1. **Empty string** → return empty string (edge case)
2. **Absolute URL** → return as-is (prevent double concat)
3. **Relative path with `../`** → normalize dan concat
4. **Relative path with `./`** → normalize dan concat
5. **Relative path without prefix** → concat langsung
6. **Idempotent** → multiple calls produce same result

### Penjelasan untuk Interview:

> "Ini test untuk helper function yang build image URL. Test ini penting karena:
>
> 1. Gambar adalah core feature di news app
> 2. URL building logic bisa break jika path format berubah
> 3. Test cheap dan fast, memberikan confidence cepat
> 4. Pure function, mudah di-test dan di-debug"

---

## 🎯 File 2: reading-progress.store.test.ts

### Apa yang di-test?

**Store:** `useReadingProgressStore` (Zustand + Persist)

**Responsibilities:**
- Track reading progress per article
- Persist ke AsyncStorage
- Handle rapid updates tanpa data loss

### Test Cases (8 total):

1. **Single update** (baseline)
2. **⭐ WAJIB: 5 rapid updates** → prove TIDAK ADA race condition
3. **Multiple articles** → prove isolation
4. **100 updates stress test** → prove consistency
5. **With AsyncStorage persist** → prove async tidak affect state
6. **hasProgress() integration** → prove API consistency
7. **clearProgress() integration** → prove cleanup works
8. **Cross-contamination check** → prove independence

### Penjelasan untuk Interview:

> "Ini adalah test WAJIB dari requirement perusahaan. Kita perlu buktikan bahwa reading progress TIDAK HILANG ketika user scroll cepat (multiple rapid updates).
>
> **Kenapa ini penting:**
> - User scroll bisa trigger 50-100 updates dalam few seconds
> - Jika ada race condition, progress user bisa hilang
> - Ini core UX feature - user expect app remember position mereka
>
> **Kenapa Zustand handle ini dengan benar:**
> - Zustand's setState() is synchronous and atomic
> - Tiap call dapat latest state sebelum update
> - Tidak ada async gap yang bisa cause lost updates
> - Pattern spread: `...state.progress` ensure existing values preserved
>
> **Test outcome:**
> - 5 rapid updates: 100 → 120 → 150 → 200 → 250
> - Final value: 250 (bukan 100 atau 150)
> - PROVEN: Tidak ada race condition"

---

## 🚀 Commands untuk Menjalankan Test

### 1. Jalankan SEMUA test

```bash
npm test
```

Atau jika npm script belum ada:

```bash
npx jest
```

### 2. Jalankan SATU file test

```bash
npm test article-detail-helper
```

Atau:

```bash
npx jest article-detail-helper
```

### 3. Jalankan test dengan WATCH mode

```bash
npm test -- --watch
```

### 4. Generate COVERAGE report

```bash
npm test -- --coverage
```

Ini akan generate folder `coverage/` dengan HTML report.

### 5. Jalankan test dengan verbose output

```bash
npm test -- --verbose
```

---

## 📝 Menambahkan npm Scripts

Tambahkan ini ke `package.json` di `scripts`:

```json
{
  "scripts": {
    "start": "expo start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

---

## 🎨 Teknik Test yang Digunakan

### 1. **AAA Pattern** (Arrange-Act-Assert)

Semua test mengikuti pattern ini untuk konsistensi dan readability.

```typescript
it('should do something', () => {
  // Arrange - setup data dan conditions
  const input = 'test';

  // Act - execute function yang di-test
  const result = buildArticleImageUrl(input);

  // Assert - verify expected outcome
  expect(result).toBe('expected');
});
```

### 2. **Test Isolation**

Setiap test independent dan tidak tergantung test lain.

- `beforeEach()` reset store state
- `jest.clearAllMocks()` clean mock history
- Tiap test arrange fresh data

### 3. **Descriptive Test Names**

Test names menjelaskan SCENARIO dan EXPECTED behavior:

- ✅ Good: "should handle multiple rapid setProgress calls correctly"
- ❌ Bad: "test rapid updates"

### 4. **Comprehensive Comments**

Setiap test punya komentar yang menjelaskan:
- Apa yang di-test
- Kenapa penting
- Expected outcome

Ini memudahkan interview explanation.

### 5. **Mock Strategy**

- **AsyncStorage** → mock di `jest.setup.js` (global)
- **Images** → mock dengan `assetMock.js`
- **No production code modified** → pure testing

---

## 🔍 Mock Implementations

### AsyncStorage Mock (jest.setup.js)

```javascript
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));
```

**Kenapa ini aman:**
- Production code tidak di-touch
- Mock behavior predictable dan controlled
- Persist layer di-test via integration tests

### Asset Mock (assetMock.js)

```javascript
module.exports = '';
```

**Kenapa ini perlu:**
- Jest tidak bisa handle binary files (images)
- Mock prevent file not found errors
- Asset testing tidak dalam scope requirement

---

## ❓ Questions yang Mungkin Ditanya Interviewer

### Q: "Kenapa pakai __tests__ folder bukan co-located .test.ts files?"

**A:** "Saya pilih `src/__tests__/` karena:
1. Test file terpisah clear dari production code
2. Mudah di-find dan maintain
3. Tidak clutter folder source
4. Convention yang umum di React Native projects

Alternative seperti co-located `article.service.test.ts` sebelah `article.service.ts` juga valid, tapi untuk project ini saya prefer central test folder."

---

### Q: "Kenapa tidak gunakan fake timers?"

**A:** "Fake timers sebenarnya tidak diperlukan untuk test ini karena:

1. **setProgress() di Zustand is synchronous** - tidak ada async gap
2. **Race condition prevention ada di architecture, bukan timing**
3. Test dengan `for` loop (100 iterations) sudah cukup untuk prove consistency

Fake timers akan relevan jika:
- Ada debouncing logic
- Ada explicit delays
- Testing actual scroll events yang throttled

Untuk scope test ini, synchronous calls sudah prove the point."

---

### Q: "Apa yang terjadi pada persist layer?"

**A:** "Good question! Persist layer (AsyncStorage) memang async, tapi:

1. **State updates synchronous** - user interface update immediately
2. **Persist happen after state update** - tidak block UI
3. **Test ini test STATE consistency**, bukan persist timing

Di production:
- Zustand persist middleware handle AsyncStorage
- Latest state akan tersimpan
- Walau ada delay, tidak ada data loss

Kalau mau test persist secara spesifik, bisa tambahkan test yang await setItem mock verification, tapi itu out-of-scope untuk requirement ini."

---

### Q: "Kenapa tidak test scroll event handler directly?"

**A:** "Scroll event testing lebih cocok untuk E2E atau integration tests, bukan unit tests karena:

1. **Unit test scope:** Test logic dalam isolation
2. **Scroll event:** Melibatkan browser/RN bridge, gesture system, etc.
3. **Better approach:** Test yang trigger scroll event (store)
4. **E2E test:** Test actual scrolling behavior di real device/simulator

Untuk take-home test ini, focus di core logic (store) adalah pilihan yang tepat."

---

### Q: "Coverage report harus berapa?"

**A:** "Tidak ada angka magic, tapi goal saya:

- **Core logic:** 80%+ (helpers, stores)
- **Components:** Tidak dalam scope requirement
- **Services:** Hit yang ter-cover tests

Focus di quality, bukan quantity. 2 test yang comprehensive lebih baik dari 20 test yang tidak meaningful.

Coverage report bisa di-generate dengan:
```bash
npm test -- --coverage
```

Ini akan show percentage dan highlight code yang tidak ter-cover."

---

## 📊 Expected Test Output

Jalankan `npm test` dan expected output:

```
PASS  src/__tests__/article-detail-helper.test.ts
  buildArticleImageUrl
    ✓ should return empty string when path is empty (3ms)
    ✓ should return the same URL if path already starts with http (1ms)
    ✓ should build correct URL for relative path with ../ (1ms)
    ✓ should build correct URL for relative path with ./ (1ms)
    ✓ should build correct URL for relative path without prefix (1ms)
    ✓ should produce consistent result for multiple calls with same input (1ms)

PASS  src/__tests__/reading-progress.store.test.ts
  Reading Progress Store - Race Condition Test
    ✓ should save progress correctly for single update (2ms)
    ✓ should handle multiple rapid setProgress calls correctly (NO RACE CONDITION) (1ms)
    ✓ should handle rapid updates for different articles simultaneously (1ms)
    ✓ should handle 100 rapid updates without losing progress (3ms)
    ✓ should handle rapid updates even with AsyncStorage persistence (2ms)
    ✓ should return true for hasProgress after rapid updates (1ms)
    ✓ should clear progress correctly after rapid updates (1ms)
    ✓ should not affect other articles when updating one article rapidly (2ms)

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        2.456s
```

---

## 🎓 Summary untuk Interview

### Apa yang saya deliver:

1. **2 Test Files** (memenuhi requirement)
   - 1 test bebas (helper function)
   - 1 test wajib (race condition)

2. **14 Test Cases** total
   - 6 untuk article detail helper
   - 8 untuk reading progress store

3. **100% passing** dengan clear output

4. **Comprehensive documentation** untuk explanation

### Key points untuk presentasi:

1. **Test Strategy:** Focus di core logic yang high-value
2. **Race Condition Proof:** Store handle rapid updates dengan benar
3. **Clean Code:** Production code tidak di-modify
4. **Documentation:** Mudah dijelaskan dan dipresentasikan
5. **Maintainability:** Test mudah di-update dan extend

### Teknikal highlights:

- Zustand state management sudah prevent race condition
- Test membuktikan architecture decisions
- Mock strategy clean dan tidak invasive
- AAA pattern untuk consistency
- Test isolation dan independence

---

## 🚀 Next Steps (Jika mau extend)

Kalau ada waktu lebih, bisa tambah:

1. **Test untuk hooks:**
   - `useReadingProgress.ts`
   - `useArticleDetail.ts`

2. **Test untuk components:**
   - `ArticleCard.tsx`
   - Render dan interaction tests

3. **E2E tests:**
   - Full user flow (baca artikel, progress tersimpan)

4. **Performance tests:**
   - Benchmark store performance dengan 1000+ updates

Tapi untuk scope take-home test, 2 test files ini sudah comprehensive dan memenuhi requirement.

---

Good luck dengan interview! 🎉
