import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  articleQueryKeys,
  CACHE_TIMES,
  invalidateQueries,
  getQueryClient
} from '@/providers/query-provider';

/**
 * Article type definitions
 */
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  readingTime: number; // in minutes
  views: number;
  likes: number;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ArticleSearchParams {
  query: string;
  category?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
}

/**
 * Mock API functions - Replace these with actual API calls
 */
const articleApi = {
  // Get article by ID
  getById: async (id: string): Promise<Article> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock response
    return {
      id,
      title: `Article ${id}`,
      content: 'Full article content here...',
      excerpt: 'Article excerpt...',
      author: 'John Doe',
      category: 'Technology',
      tags: ['react', 'typescript'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: 5,
      views: 100,
      likes: 25,
    };
  },

  // Get article list
  getList: async (params: ArticleSearchParams = { query: '' }): Promise<ArticleListResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock response
    const articles: Article[] = Array.from({ length: 10 }, (_, i) => ({
      id: `article-${i + 1}`,
      title: `Article ${i + 1}`,
      content: `Content for article ${i + 1}`,
      excerpt: `Excerpt for article ${i + 1}`,
      author: 'John Doe',
      category: 'Technology',
      tags: ['react', 'typescript'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: 5,
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
    }));

    return {
      articles,
      total: 50,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      hasMore: true,
    };
  },

  // Search articles
  search: async (params: ArticleSearchParams): Promise<ArticleListResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return articleApi.getList(params);
  },

  // Create article
  create: async (data: Partial<Article>): Promise<Article> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      ...data,
      id: `new-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: 5,
      views: 0,
      likes: 0,
    } as Article;
  },

  // Update article
  update: async (id: string, data: Partial<Article>): Promise<Article> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    } as Article;
  },

  // Delete article
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // Like article
  like: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },
};

/**
 * Hook: Get article by ID
 * Uses article-specific cache configuration
 */
export const useArticle = (id: string, options?: { enabled?: boolean }): UseQueryResult<Article, Error> => {
  return useQuery({
    queryKey: articleQueryKeys.detail(id),
    queryFn: () => articleApi.getById(id),
    staleTime: CACHE_TIMES.ARTICLE.staleTime,
    gcTime: CACHE_TIMES.ARTICLE.gcTime,
    enabled: options?.enabled !== false && !!id, // Only run if ID is provided
    networkMode: 'online',
  });
};

/**
 * Hook: Get article list
 * Uses list-specific cache configuration
 */
export const useArticleList = (
  params: ArticleSearchParams = { query: '' },
  options?: { enabled?: boolean }
): UseQueryResult<ArticleListResponse, Error> => {
  const queryString = JSON.stringify(params);

  return useQuery({
    queryKey: articleQueryKeys.list(queryString),
    queryFn: () => articleApi.getList(params),
    staleTime: CACHE_TIMES.ARTICLE_LIST.staleTime,
    gcTime: CACHE_TIMES.ARTICLE_LIST.gcTime,
    enabled: options?.enabled !== false,
    networkMode: 'online',
  });
};

/**
 * Hook: Search articles
 * Uses search-specific cache configuration
 */
export const useArticleSearch = (
  params: ArticleSearchParams,
  options?: { enabled?: boolean }
): UseQueryResult<ArticleListResponse, Error> => {
  const searchKey = `${params.query}-${params.category}-${params.page}`;

  return useQuery({
    queryKey: articleQueryKeys.search(searchKey),
    queryFn: () => articleApi.search(params),
    staleTime: CACHE_TIMES.ARTICLE_SEARCH.staleTime,
    gcTime: CACHE_TIMES.ARTICLE_SEARCH.gcTime,
    enabled: (options?.enabled !== false) && params.query.length > 0, // Only run if query exists
    networkMode: 'online',
  });
};

/**
 * Hook: Create article
 */
export const useCreateArticle = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Article>) => articleApi.create(data),

    onSuccess: (newArticle) => {
      // Invalidate article list queries
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() });

      // Add new article to cache
      queryClient.setQueryData(
        articleQueryKeys.detail(newArticle.id),
        newArticle
      );
    },

    onError: (error) => {
      console.error('Failed to create article:', error);
    },
  });
};

/**
 * Hook: Update article
 */
export const useUpdateArticle = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Article> }) =>
      articleApi.update(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel ongoing refetches
      await queryClient.cancelQueries({ queryKey: articleQueryKeys.detail(id) });

      // Snapshot previous value
      const previousArticle = queryClient.getQueryData(
        articleQueryKeys.detail(id)
      );

      // Optimistically update cache
      queryClient.setQueryData(
        articleQueryKeys.detail(id),
        (old: Article | undefined) => ({
          ...old,
          ...data,
          updatedAt: new Date().toISOString(),
        } as Article)
      );

      // Return context with previous value
      return { previousArticle };
    },

    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousArticle) {
        queryClient.setQueryData(
          articleQueryKeys.detail(variables.id),
          context.previousArticle
        );
      }
      console.error('Failed to update article:', error);
    },

    onSettled: (_data, _error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: articleQueryKeys.detail(variables.id)
      });
    },
  });
};

/**
 * Hook: Delete article
 */
export const useDeleteArticle = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => articleApi.delete(id),

    onSuccess: (_, id) => {
      // Remove deleted article from cache
      queryClient.removeQueries({ queryKey: articleQueryKeys.detail(id) });

      // Invalidate article list queries
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() });
    },

    onError: (error) => {
      console.error('Failed to delete article:', error);
    },
  });
};

/**
 * Hook: Like article
 */
export const useLikeArticle = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: (id: string) => articleApi.like(id),

    onMutate: async (id) => {
      // Cancel ongoing refetches
      await queryClient.cancelQueries({ queryKey: articleQueryKeys.detail(id) });

      // Snapshot previous value
      const previousArticle = queryClient.getQueryData(
        articleQueryKeys.detail(id)
      );

      // Optimistically update likes count
      queryClient.setQueryData(
        articleQueryKeys.detail(id),
        (old: Article | undefined) => ({
          ...old,
          likes: (old?.likes || 0) + 1,
        } as Article)
      );

      // Return context with previous value
      return { previousArticle };
    },

    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousArticle) {
        queryClient.setQueryData(
          articleQueryKeys.detail(id),
          context.previousArticle
        );
      }
      console.error('Failed to like article:', error);
    },
  });
};

/**
 * Hook: Prefetch article
 * Useful for preloading data before navigation
 */
export const usePrefetchArticle = () => {
  const queryClient = getQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: articleQueryKeys.detail(id),
      queryFn: () => articleApi.getById(id),
      staleTime: CACHE_TIMES.ARTICLE.staleTime,
    });
  };
};

/**
 * Hook: Invalidate article cache
 * Useful for manual cache invalidation
 */
export const useInvalidateArticles = () => {
  const queryClient = getQueryClient();

  return {
    invalidateArticle: (id: string) => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.detail(id) });
    },

    invalidateArticleList: () => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() });
    },

    invalidateAllArticles: () => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.all });
    },
  };
};
