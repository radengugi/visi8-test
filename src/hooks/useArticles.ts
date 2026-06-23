import {
  Article,
  getArticles
} from '@/services/articles.service';
import { useInfiniteQuery } from '@tanstack/react-query';

const ITEMS_PER_PAGE = 5;

interface ArticlePage {
  items: Article[];
  hasNextPage: boolean;
  page: number;
}

export const useArticles = () => {
  return useInfiniteQuery({
    queryKey: ['articles'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<ArticlePage> => {
      const response: Article[] = await getArticles();
      const startIndex = pageParam * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const items = response.slice(startIndex, endIndex);

      return {
        items,
        page: pageParam,
        hasNextPage: endIndex < response.length,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage
        ? lastPage.page + 1
        : undefined;
    },

    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};