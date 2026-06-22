import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useIsLoggedIn, useAuthLoading, useAuthActions, useAuthError, useUser } from '@/stores/auth.store';

/**
 * Auth guard configuration options
 */
export interface AuthGuardOptions {
  protectedRoutes?: string[];
  publicRoutes?: string[];
  loginRoute?: string;
  homeRoute?: string;
}

/**
 * Type for router navigation methods
 */
type RouterNavigation = {
  replace: (href: string) => void;
  push: (href: string) => void;
  back: () => void;
};

/**
 * Auth Guard Hook
 * Protects routes and redirects based on authentication status
 *
 * Usage in your root layout:
 * ```tsx
 * export default function RootLayout() {
 *   useAuthGuard();
 *   return <Stack />;
 * }
 * ```
 */
export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const segments = useSegments();
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const isLoading = useAuthLoading();
  const { restoreSession } = useAuthActions();

  const {
    protectedRoutes = [],
    publicRoutes = ['login', 'register', 'forgot-password'],
    loginRoute = '/',
    homeRoute = '/'
  }: AuthGuardOptions = options;

  useEffect(() => {
    // Restore session on mount
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;

    // Only redirect if routes are explicitly configured
    if (protectedRoutes.length === 0 && publicRoutes.length === 0) {
      return;
    }

    // Get current path as string
    const currentPath: string = segments.join('/');

    // Check if current route is public
    const isPublicRoute: boolean = publicRoutes.some((route: string): boolean =>
      currentPath.includes(route)
    );

    // Check if current route is protected
    const isProtectedRoute: boolean = protectedRoutes.some((route: string): boolean =>
      currentPath.includes(route)
    );

    // Type-safe navigation helper
    const navigateToRoute = (route: string): void => {
      try {
        // Use router's replace method with proper string type
        (router as RouterNavigation).replace(route);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    if (!isLoggedIn && isProtectedRoute) {
      // Redirect to login if not logged in and trying to access protected route
      navigateToRoute(loginRoute);
    } else if (isLoggedIn && isPublicRoute) {
      // Redirect to home if logged in and trying to access public route
      navigateToRoute(homeRoute);
    }
  }, [isLoggedIn, isLoading, segments, router, publicRoutes, protectedRoutes, loginRoute, homeRoute]);
};

/**
 * Use Auth Hook
 * Returns auth state and actions in a single hook
 *
 * Usage:
 * ```tsx
 * const { isLoggedIn, user, login, logout, isLoading } = useAuth();
 * ```
 */
export const useAuth = () => {
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const { login, logout, restoreSession, setError, clearError } = useAuthActions();

  return {
    // State
    isLoggedIn,
    user,
    isLoading,
    error,

    // Actions
    login,
    logout,
    restoreSession,
    setError,
    clearError,
  };
};

/**
 * Require Auth Hook
 * Throws an error if user is not authenticated
 * Use this in components that require authentication
 *
 * Usage:
 * ```tsx
 * const { user } = requireAuth();
 * ```
 */
export const requireAuth = () => {
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  if (!isLoggedIn || !user) {
    throw new Error('Authentication required');
  }

  return { isLoggedIn, user };
};
