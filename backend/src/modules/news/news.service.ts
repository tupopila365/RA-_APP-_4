import { NewsModel, INews } from './news.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateNewsDTO {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published?: boolean;
}

export interface UpdateNewsDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  author?: string;
  imageUrl?: string;
  published?: boolean;
}

export interface ListNewsQuery {
  page?: number;
  limit?: number;
  category?: string;
  published?: boolean;
  search?: string;
}

export interface ListNewsResult {
  news: INews[];
  total: number;
  page: number;
  totalPages: number;
}

class NewsService {
  /**
   * Create a new news article
   */
  async createNews(dto: CreateNewsDTO): Promise<INews> {
    try {
      logger.info('Creating news article:', { title: dto.title });

      const news = await NewsModel.create({
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt,
        category: dto.category,
        author: dto.author,
        imageUrl: dto.imageUrl,
        published: dto.published || false,
      });

      logger.info(`News article created with ID: ${news._id}`);
      return news;
    } catch (error: any) {
      logger.error('Create news error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create news article',
        details: error.message,
      };
    }
  }

  /**
   * List news articles with pagination, filtering, and search
   */
  async listNews(query: ListNewsQuery): Promise<ListNewsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.category) {
        filter.category = query.category;
      }

      if (query.published !== undefined) {
        filter.published = query.published;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [news, total] = await Promise.all([
        NewsModel.find(filter)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NewsModel.countDocuments(filter),
      ]);

      return {
        news: news as unknown as INews[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List news error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve news articles',
        details: error.message,
      };
    }
  }

  /**
   * Get a single news article by ID
   */
  async getNewsById(newsId: string): Promise<INews> {
    try {
      const news = await NewsModel.findById(newsId).lean();

      if (!news) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'News article not found',
        };
      }

      return news as unknown as INews;
    } catch (error: any) {
      logger.error('Get news error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve news article',
        details: error.message,
      };
    }
  }

  /**
   * Update a news article
   */
  async updateNews(newsId: string, dto: UpdateNewsDTO): Promise<INews> {
    try {
      logger.info(`Updating news article: ${newsId}`);

      const updateData: any = { ...dto };

      // If publishing for the first time, set publishedAt
      if (dto.published === true) {
        const existingNews = await NewsModel.findById(newsId);
        if (existingNews && !existingNews.published && !existingNews.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const news = await NewsModel.findByIdAndUpdate(
        newsId,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!news) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'News article not found',
        };
      }

      logger.info(`News article ${newsId} updated successfully`);
      return news as unknown as INews;
    } catch (error: any) {
      logger.error('Update news error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update news article',
        details: error.message,
      };
    }
  }

  /**
   * Delete a news article
   */
  async deleteNews(newsId: string): Promise<void> {
    try {
      // Validate ID is provided
      if (!newsId || newsId === 'undefined' || newsId === 'null') {
        logger.error('Delete called with invalid ID:', newsId);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'News ID is required',
        };
      }

      logger.info(`Deleting news article: ${newsId}`);

      const news = await NewsModel.findByIdAndDelete(newsId);

      if (!news) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'News article not found',
        };
      }

      logger.info(`News article ${newsId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete news error:', { newsId, error: error.message });
      if (error.statusCode) {
        throw error;
      }
      
      // Handle Mongoose CastError (invalid ObjectId format)
      if (error.name === 'CastError') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid news ID format',
          details: error.message,
        };
      }
      
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete news article',
        details: error.message,
      };
    }
  }
}

export const newsService = new NewsService();
