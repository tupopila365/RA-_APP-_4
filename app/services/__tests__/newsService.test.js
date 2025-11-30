import { newsService } from '../newsService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    NEWS: '/news',
    NEWS_DETAIL: (id) => `/news/${id}`,
  },
}));

describe('newsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNews', () => {
    it('fetches news successfully', async () => {
      const mockNews = {
        data: [
          { id: 1, title: 'News 1', published: true },
          { id: 2, title: 'News 2', published: true },
        ],
      };

      ApiClient.get.mockResolvedValue(mockNews);

      const result = await newsService.getNews();

      expect(ApiClient.get).toHaveBeenCalledWith('/news?published=true');
      expect(result).toEqual(mockNews.data);
    });

    it('fetches news with custom parameters', async () => {
      const mockNews = { data: [] };
      ApiClient.get.mockResolvedValue(mockNews);

      await newsService.getNews({ category: 'Safety', page: 2 });

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('published=true')
      );
      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('category=Safety')
      );
    });

    it('handles API errors', async () => {
      const error = new Error('Network error');
      ApiClient.get.mockRejectedValue(error);

      await expect(newsService.getNews()).rejects.toThrow('Network error');
    });
  });

  describe('getNewsDetail', () => {
    it('fetches news detail successfully', async () => {
      const mockNewsDetail = {
        data: { id: 1, title: 'News Detail', content: 'Full content' },
      };

      ApiClient.get.mockResolvedValue(mockNewsDetail);

      const result = await newsService.getNewsDetail(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/news/1');
      expect(result).toEqual(mockNewsDetail.data);
    });

    it('handles API errors', async () => {
      const error = new Error('Not found');
      ApiClient.get.mockRejectedValue(error);

      await expect(newsService.getNewsDetail(999)).rejects.toThrow('Not found');
    });
  });

  describe('searchNews', () => {
    it('searches news with query', async () => {
      const mockNews = { data: [] };
      ApiClient.get.mockResolvedValue(mockNews);

      await newsService.searchNews('road safety');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=road+safety')
      );
    });
  });

  describe('getNewsByCategory', () => {
    it('fetches news by category', async () => {
      const mockNews = { data: [] };
      ApiClient.get.mockResolvedValue(mockNews);

      await newsService.getNewsByCategory('Infrastructure');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('category=Infrastructure')
      );
    });
  });
});
