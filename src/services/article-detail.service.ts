import axios from 'axios';

const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';

export interface ArticleDetail {
  id: string;
  title: string;
  date: string;
  image: string;
  body: string;
}

export const getArticleDetail = async (articleId: string): Promise<ArticleDetail> => {
  const { data } = await axios.get<ArticleDetail>(
    `${GITHUB_RAW_BASE_URL}/articles/${articleId}.json`
  );
  return data;
};

export const buildArticleImageUrl = (
  path: string
): string => {
  if (!path) {
    return '';
  }

  if (path.startsWith('http')) {
    return path;
  }

  const normalizedPath = path
    .replace('../', '/')
    .replace('./', '/');

  return `${GITHUB_RAW_BASE_URL}${normalizedPath}`;
};
