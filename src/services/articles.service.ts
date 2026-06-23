import axios from 'axios';

const API_URL =
  'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main/articles.json';

const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/visi8-ppramesi/visi8-interview-mock-backend/main';

export interface Article {
  id: string;
  title: string;
  date: string;
  banner_url: string;
}

export const getArticles = async (): Promise<Article[]> => {
  const { data } = await axios.get<Article[]>(API_URL);

  return data;
};

export const buildImageUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }

  return `${IMAGE_BASE_URL}${path}`;
};