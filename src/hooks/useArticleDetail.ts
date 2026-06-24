import {
  ArticleDetail,
  getArticleDetail
} from '@/services/article-detail.service';
import { useQuery } from '@tanstack/react-query';

export const useArticleDetail = (articleId: string) => {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(articleId),

    // Cache settings - artikel jarang berubah
    staleTime: 1000 * 60 * 30, // 30 menit
    gcTime: 1000 * 60 * 60, // 1 jam

    // Jangan refetch ketika screen dibuka kembali
    refetchOnMount: false,
    refetchOnWindowFocus: false,

    // Refetch jika reconnect ke internet
    refetchOnReconnect: true,

    // Enabled hanya jika articleId valid
    enabled: !!articleId && articleId.length > 0,
  });
};

export type UseArticleDetailResult = ReturnType<typeof useArticleDetail>;
