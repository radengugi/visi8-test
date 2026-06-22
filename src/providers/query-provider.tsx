import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * TanStack Query configuration for Expo Router
 * Optimized for React Native with sensible cache defaults
 */

// Default cache times for different types of data
export const CACHE_TIMES = {
  // Article-related cache times
  ARTICLE: {
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection time (was cacheTime)
  },
  ARTICLE_LIST: {
    staleTime: 2 * 60 * 1000, // 2 minutes - list data changes more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  ARTICLE_SEARCH: {
    staleTime: 1 * 60 * 1000, // 1 minute - search results should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // User-related cache times
  USER_PROFILE: {
    staleTime: 10 * 60 * 1000, // 10 minutes - user data changes infrequently
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  USER_SESSION: {
    staleTime: 0, // 0 minutes - always check session status
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  // General cache times
  DEFAULT: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  IMMUTABLE: {
    staleTime: Infinity, // Never stale - for truly static data
    gcTime: Infinity, // Never garbage collect
  },
};

// Retry configuration
const RETRY_CONFIG = {
  retries: (failureCount: number, error: unknown): boolean => {
    // Don't retry on 4xx errors (client errors)
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Check for client error codes
      if (errorMessage.includes('400') ||
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('404') ||
          errorMessage.includes('422')) {
        return false;
      }

      // Don't retry specific error types
      if (errorMessage.includes('authentication') ||
          errorMessage.includes('authorization') ||
          errorMessage.includes('not found')) {
        return false;
      }
    }

    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number): number =>
    Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
};

/**
 * Create QueryClient with sensible defaults for React Native
 */
const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache configuration
        staleTime: CACHE_TIMES.DEFAULT.staleTime,
        gcTime: CACHE_TIMES.DEFAULT.gcTime,

        // Retry configuration
        retry: RETRY_CONFIG.retries,
        retryDelay: RETRY_CONFIG.retryDelay,

        // Refetch configuration
        refetchOnWindowFocus: false, // Not relevant for React Native
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true, // Refetch when network reconnects

        // Polling (disabled by default)
        refetchInterval: false,
        refetchIntervalInBackground: false,

        // Network mode
        networkMode: 'online', // Only execute when online

        // Error handling
        throwOnError: false, // Don't throw errors by default

        // Structural sharing
        structuralSharing: true, // Share data between similar queries
      },
      mutations: {
        // Retry configuration for mutations
        retry: RETRY_CONFIG.retries,
        retryDelay: RETRY_CONFIG.retryDelay,

        // Network mode
        networkMode: 'online',

        // Error handling
        throwOnError: false,
      },
    },
  });

  // Set up global error handlers using the cache's built-in methods
  queryClient.getQueryCache().config = {
    onError: (error: unknown) => {
      console.error('Query cache error:', error);
    },
  };

  queryClient.getMutationCache().config = {
    onError: (error: unknown) => {
      console.error('Mutation cache error:', error);
    },
  };
};

// Create singleton instance
const queryClient = createQueryClient();

/**
 * Query Provider Component
 * Wraps the app with TanStack Query functionality
 */
interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Get the singleton query client instance
 * Use this for direct access if needed
 */
export const getQueryClient = (): QueryClient => {
  return queryClient;
};

/**
 * Reset query client (useful for logout/testing)
 */
export const resetQueryClient = (): void => {
  queryClient.clear();
  queryClient.getQueryCache().clear();
  queryClient.getMutationCache().clear();
};

/**
 * Prefetch multiple queries
 * Useful for preloading data
 */
export const prefetchQueries = async (queries: Array<{
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
}>): Promise<void> => {
  try {
    await Promise.all(
      queries.map(({ queryKey, queryFn }) =>
        queryClient.prefetchQuery({ queryKey, queryFn })
      )
    );
  } catch (error) {
    console.error('Error prefetching queries:', error);
  }
};

/**
 * Invalidate multiple queries
 * Useful for clearing related cache after mutations
 */
export const invalidateQueries = async (filters: Array<{
  queryKey?: unknown[];
  type?: 'active' | 'all' | 'inactive';
}>): Promise<void> => {
  try {
    await Promise.all(
      filters.map(filter =>
        queryClient.invalidateQueries(filter)
      )
    );
  } catch (error) {
    console.error('Error invalidating queries:', error);
  }
};

/**
 * Get query count for analytics/debugging
 */
export const getQueryStats = (): {
  total: number;
  active: number;
  inactive: number;
  stale: number;
} => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  return {
    total: queries.length,
    active: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    inactive: queries.filter(q => q.getObserversCount() === 0).length,
    stale: queries.filter(q => q.isStale()).length,
  };
};

// Type-safe query helper for articles
export const articleQueryKeys = {
  all: ['articles'] as const,
  lists: () => ['articles', 'list'] as const,
  list: (filters: string) => ['articles', 'list', filters] as const,
  details: () => ['articles', 'detail'] as const,
  detail: (id: string) => ['articles', 'detail', id] as const,
  search: (query: string) => ['articles', 'search', query] as const,
  progress: (id: string) => ['articles', 'progress', id] as const,
};

// Type-safe query helper for users
export const userQueryKeys = {
  all: ['users'] as const,
  profile: () => ['users', 'profile'] as const,
  session: () => ['users', 'session'] as const,
  preferences: () => ['users', 'preferences'] as const,
};

// Type-safe query helper for general app data
export const appQueryKeys = {
  config: () => ['app', 'config'] as const,
  settings: () => ['app', 'settings'] as const,
  version: () => ['app', 'version'] as const,
};

export default QueryProvider;
