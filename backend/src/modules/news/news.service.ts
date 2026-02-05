import { AppDataSource } from '../../config/db';
import { News } from './news.entity';
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
  news: News[];
  total: number;
  page: number;
  totalPages: number;
}

class NewsService {
  async createNews(dto: CreateNewsDTO): Promise<News> {
    try {
      logger.info('Creating news article:', { title: dto.title });
      const repo = AppDataSource.getRepository(News);
      const news = repo.create({
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt,
        category: dto.category,
        author: dto.author,
        imageUrl: dto.imageUrl,
        published: dto.published || false,
      });
      await repo.save(news);
      logger.info(`News article created with ID: ${news.id}`);
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

  async listNews(query: ListNewsQuery): Promise<ListNewsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(News);

      const buildQb = () => {
        const qb = repo.createQueryBuilder('n');
        if (query.category) qb.andWhere('n.category = :category', { category: query.category });
        if (query.published !== undefined) qb.andWhere('n.published = :published', { published: query.published });
        if (query.search) {
          qb.andWhere('(n.title LIKE :search OR n.content LIKE :search OR n.excerpt LIKE :search)', {
            search: `%${query.search}%`,
          });
        }
        return qb;
      };

      const [news, total] = await Promise.all([
        buildQb().orderBy('n.publishedAt', 'DESC').addOrderBy('n.createdAt', 'DESC').skip(skip).take(limit).getMany(),
        buildQb().getCount(),
      ]);

      return { news, total, page, totalPages: Math.ceil(total / limit) };
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

  async getNewsById(newsId: string): Promise<News> {
    try {
      const id = parseInt(newsId, 10);
      const repo = AppDataSource.getRepository(News);
      const news = await repo.findOne({ where: { id } });
      if (!news) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'News article not found' };
      }
      return news;
    } catch (error: any) {
      logger.error('Get news error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve news article',
        details: error.message,
      };
    }
  }

  async updateNews(newsId: string, dto: UpdateNewsDTO): Promise<News> {
    try {
      logger.info(`Updating news article: ${newsId}`);
      const id = parseInt(newsId, 10);
      const repo = AppDataSource.getRepository(News);
      const news = await repo.findOne({ where: { id } });
      if (!news) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'News article not found' };
      }
      if (dto.published === true && !news.publishedAt) {
        news.publishedAt = new Date();
      }
      Object.assign(news, dto);
      await repo.save(news);
      logger.info(`News article ${newsId} updated successfully`);
      return news;
    } catch (error: any) {
      logger.error('Update news error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update news article',
        details: error.message,
      };
    }
  }

  async deleteNews(newsId: string): Promise<void> {
    try {
      if (!newsId || newsId === 'undefined' || newsId === 'null') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'News ID is required',
        };
      }
      logger.info(`Deleting news article: ${newsId}`);
      const id = parseInt(newsId, 10);
      if (isNaN(id)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid news ID format',
        };
      }
      const repo = AppDataSource.getRepository(News);
      const news = await repo.findOne({ where: { id } });
      if (!news) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'News article not found' };
      }
      await repo.remove(news);
      logger.info(`News article ${newsId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete news error:', { newsId, error: (error as Error).message });
      if (error.statusCode) throw error;
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
