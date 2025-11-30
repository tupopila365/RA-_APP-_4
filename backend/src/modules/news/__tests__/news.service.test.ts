// Set up environment variables before imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.RAG_SERVICE_URL = 'http://localhost:8000';
process.env.CORS_ORIGIN = 'http://localhost:3001';

import { newsService } from '../news.service';
import { NewsModel } from '../news.model';

jest.mock('../news.model');
jest.mock('../../../utils/logger');

describe('NewsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNews', () => {
    it('should create a news article successfully', async () => {
      const mockNews = {
        _id: 'news123',
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
        published: false,
      };

      (NewsModel.create as jest.Mock).mockResolvedValue(mockNews);

      const result = await newsService.createNews({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
      });

      expect(result).toEqual(mockNews);
      expect(NewsModel.create).toHaveBeenCalledWith({
        title: 'Test News',
        content: 'Test content',
        excerpt: 'Test excerpt',
        category: 'general',
        author: 'Test Author',
        imageUrl: undefined,
        published: false,
      });
    });

    it('should throw error if creation fails', async () => {
      (NewsModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(
        newsService.createNews({
          title: 'Test News',
          content: 'Test content',
          excerpt: 'Test excerpt',
          category: 'general',
          author: 'Test Author',
        })
      ).rejects.toMatchObject({
        statusCode: 500,
        message: 'Failed to create news article',
      });
    });
  });

  describe('listNews', () => {
    it('should list news with pagination', async () => {
      const mockNews = [
        { _id: '1', title: 'News 1', published: true },
        { _id: '2', title: 'News 2', published: true },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockNews),
      };

      (NewsModel.find as jest.Mock).mockReturnValue(mockQuery);
      (NewsModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await newsService.listNews({ page: 1, limit: 10 });

      expect(result.news).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by category', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (NewsModel.find as jest.Mock).mockReturnValue(mockQuery);
      (NewsModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await newsService.listNews({ category: 'sports' });

      expect(NewsModel.find).toHaveBeenCalledWith({ category: 'sports' });
    });

    it('should filter by published status', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (NewsModel.find as jest.Mock).mockReturnValue(mockQuery);
      (NewsModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await newsService.listNews({ published: true });

      expect(NewsModel.find).toHaveBeenCalledWith({ published: true });
    });

    it('should search by text', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (NewsModel.find as jest.Mock).mockReturnValue(mockQuery);
      (NewsModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await newsService.listNews({ search: 'test query' });

      expect(NewsModel.find).toHaveBeenCalledWith({ $text: { $search: 'test query' } });
    });
  });

  describe('getNewsById', () => {
    it('should return news article by ID', async () => {
      const mockNews = {
        _id: 'news123',
        title: 'Test News',
        content: 'Test content',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockNews),
      };

      (NewsModel.findById as jest.Mock).mockReturnValue(mockQuery);

      const result = await newsService.getNewsById('news123');

      expect(result).toEqual(mockNews);
      expect(NewsModel.findById).toHaveBeenCalledWith('news123');
    });

    it('should throw 404 if news not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (NewsModel.findById as jest.Mock).mockReturnValue(mockQuery);

      await expect(newsService.getNewsById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'News article not found',
      });
    });
  });

  describe('updateNews', () => {
    it('should update news article successfully', async () => {
      const mockExistingNews = {
        _id: 'news123',
        published: false,
        publishedAt: null,
      };

      const mockUpdatedNews = {
        _id: 'news123',
        title: 'Updated News',
        published: true,
        publishedAt: new Date(),
      };

      (NewsModel.findById as jest.Mock).mockResolvedValue(mockExistingNews);

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUpdatedNews),
      };

      (NewsModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      const result = await newsService.updateNews('news123', {
        title: 'Updated News',
        published: true,
      });

      expect(result).toEqual(mockUpdatedNews);
    });

    it('should set publishedAt when publishing for first time', async () => {
      const mockExistingNews = {
        _id: 'news123',
        published: false,
        publishedAt: null,
      };

      (NewsModel.findById as jest.Mock).mockResolvedValue(mockExistingNews);

      const mockQuery = {
        lean: jest.fn().mockResolvedValue({}),
      };

      (NewsModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await newsService.updateNews('news123', { published: true });

      const updateCall = (NewsModel.findByIdAndUpdate as jest.Mock).mock.calls[0];
      expect(updateCall[1]).toHaveProperty('publishedAt');
    });

    it('should throw 404 if news not found', async () => {
      (NewsModel.findById as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (NewsModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        newsService.updateNews('nonexistent', { title: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'News article not found',
      });
    });
  });

  describe('deleteNews', () => {
    it('should delete news article successfully', async () => {
      const mockNews = { _id: 'news123', title: 'Test News' };

      (NewsModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockNews);

      await newsService.deleteNews('news123');

      expect(NewsModel.findByIdAndDelete).toHaveBeenCalledWith('news123');
    });

    it('should throw 404 if news not found', async () => {
      (NewsModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(newsService.deleteNews('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'News article not found',
      });
    });
  });
});
