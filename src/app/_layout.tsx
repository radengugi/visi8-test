import { QueryProvider } from '@/providers/query-provider';
import { useAuthStore } from '@/stores/auth.store';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, useColorScheme, View } from 'react-native';

/**
 * Root Layout Configuration
 *
 * Architecture:
 * 1. QueryProvider wraps entire app for data fetching
 * 2. Session restoration on mount
 * 3. Route protection based on auth state
 * 4. Theme support (dark/light)
 */

/**
 * Loading screen component
 * Displayed during session restoration
 */
const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#208AEF' }}>
    <ActivityIndicator size="large" color="#FFFFFF" />
    <Text style={{ marginTop: 16, color: '#FFFFFF', fontSize: 16 }}>Loading...</Text>
  </View>
);

/**
 * Root Layout Component
 *
 * Responsibilities:
 * - Wrap app with QueryProvider for TanStack Query
 * - Restore user session from AsyncStorage on app start
 * - Manage navigation based on authentication state
 * - Provide theme context
 *
 * Route Protection:
 * - If not authenticated → redirect to /login
 * - If authenticated → redirect to /articles
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Auth state from store
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  // Auth actions - use store directly for better type safety
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // Local state to track if session restoration is complete
  const [isSessionRestored, setIsSessionRestored] = useState<boolean>(false);

  // Track if we've already navigated to prevent loops
  const [hasNavigated, setHasNavigated] = useState<boolean>(false);

  /**
   * Restore session on app mount
   * This runs once when the app starts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsSessionRestored(true);
      }
    };

    initializeAuth();
  }, [restoreSession]);

  /**
   * Navigation logic based on auth state
   * Redirects user to appropriate route based on authentication status
   */
  useEffect(() => {
    // Only navigate after session restoration is complete
    if (!isSessionRestored) {
      return;
    }

    // Show loading screen during auth state changes
    if (isLoading) {
      return;
    }

    // Prevent infinite navigation loops
    if (hasNavigated) {
      return;
    }

    // Navigation logic - only run once
    if (isLoggedIn && user) {
      setHasNavigated(true);
      router.replace('/articles');
    } else {
      setHasNavigated(true);
      router.replace('/login');
    }
  }, [isLoggedIn, user, isLoading, isSessionRestored, router, hasNavigated]);

  // Show loading screen during session restoration
  if (!isSessionRestored || isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  // Render the main app with authentication context
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="articles"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </Stack>
      </QueryProvider>
    </ThemeProvider>
  );
}
