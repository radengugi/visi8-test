# AI Usage Notes

This document outlines how AI tools were used during the development of this technical test project.

## AI Tools Used

| ChatGPT | GLM 4.7

## Successful AI Usage

### 1. Reading Progress Implementation (State Management)

**Area:** State persistence with Zustand + AsyncStorage

AI assisted in designing a race-condition-free reading progress system that persists scroll position locally. The solution combined Zustand for state management with AsyncStorage for persistence, using atomic updates to prevent state corruption. The final implementation handles concurrent reads/writes safely and integrates seamlessly with the article reading experience.

### 2. Unit Testing for Race Conditions

**Area:** Jest test coverage for async state operations

AI helped generate comprehensive unit tests specifically targeting race condition scenarios in the reading progress feature. Tests cover concurrent save operations, rapid scroll events, and AsyncStorage failures. The test suite validates that the progress store maintains data integrity even under stress conditions.

### 3. Article List Refactoring

**Area:** Component simplification and performance

AI guided the refactoring of the article list component to reduce complexity and improve render performance. By flattening nested components and memoizing expensive computations, the component became more maintainable while preserving all functionality. The refactored code follows React best practices and is easier to extend.

## Example of Suboptimal AI Output

**Initial Suggestion:** AI recommended using `react-native-mmkv` for high-performance key-value storage.

**Issue:** The library caused a runtime error in the Expo SDK 53 managed workflow:
Failed to get NitroModules

**Resolution:** After testing, I evaluated that the error stemmed from compatibility issues with the managed workflow configuration. I switched to AsyncStorage combined with Zustand Persist middleware, which provided adequate performance for this use case while maintaining full compatibility with Expo's managed workflow. This experience reinforced the importance of validating AI suggestions against project constraints.

## AI Configuration

No dedicated AI configuration files (`CLAUDE.md`, custom rules, or agent-specific configs) were used for this project beyond standard Expo documentation references.

## Reflection

AI served as an acceleration tool for exploring implementation approaches and generating boilerplate code, particularly for unit testing and state management patterns. All suggestions were evaluated against project requirements, tested in the actual Expo environment, and verified through Jest test coverage. The final implementation choices prioritized compatibility with Expo SDK 53 and adherence to React Native best practices. AI was used as a coding assistant to augment—not replace—technical decision-making and problem-solving.