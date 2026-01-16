import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { newsService } from './news.service';
import { notificationsService } from '../notifications/notifications.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class NewsController {
  /**
   * Create a new news article
   * POST /api/news
   */
  async createNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const { title, content, excerpt, category, author, imageUrl, published } = req.body;

      if (!title || !content || !excerpt || !category || !author) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Title, content, excerpt, category, and author are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create news article
      const news = await newsService.createNews({
        title,
        content,
        excerpt,
        category,
        author,
        imageUrl,
        published: published === true,
      });

      logger.info(`News article created successfully: ${news._id}`);

      // Send push notification if published
      if (news.published === true) {
        try {
          const notifResult = await notificationsService.sendNewsNotification(
            news._id.toString(),
            news.title,
            news.excerpt
          );
          logger.info(`Push notification sent for news ${news._id}: sent=${notifResult.sentCount ?? 0}, failed=${notifResult.failedCount ?? 0}`);
        } catch (notifError: any) {
          logger.error('Failed to send notification for news:', notifError);
        }
      }

      res.status(201).json({
        success: true,
        data: {
          news: {
            id: news._id,
            title: news.title,
            content: news.content,
            excerpt: news.excerpt,
            category: news.category,
            author: news.author,
            imageUrl: news.imageUrl,
            published: news.published,
            publishedAt: news.publishedAt,
            createdAt: news.createdAt,
            updatedAt: news.updatedAt,
          },
          message: 'News article created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create news error:', error);
      next(error);
    }
  }

  /**
   * List all news articles with pagination, filtering, and search
   * GET /api/news
   */
  async listNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await newsService.listNews({
        page,
        limit,
        category,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          news: result.news.map((article) => ({
            id: article._id,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            category: article.category,
            author: article.author,
            imageUrl: article.imageUrl,
            published: article.published,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          })),
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('List news error:', error);
      next(error);
    }
  }

  /**
   * Get a single news article by ID
   * GET /api/news/:id
   */
  async getNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const news = await newsService.getNewsById(id);

      res.status(200).json({
        success: true,
        data: {
          news: {
            id: news._id,
            title: news.title,
            content: news.content,
            excerpt: news.excerpt,
            category: news.category,
            author: news.author,
            imageUrl: news.imageUrl,
            published: news.published,
            publishedAt: news.publishedAt,
            createdAt: news.createdAt,
            updatedAt: news.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get news error:', error);
      next(error);
    }
  }

  /**
   * Update a news article
   * PUT /api/news/:id
   */
  async updateNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, excerpt, category, author, imageUrl, published } = req.body;

      // Check if publish toggle from false -> true
      let wasPublishedBefore = false;
      if (published === true) {
        const existing = await newsService.getNewsById(id);
        wasPublishedBefore = existing.published === true;
      }

      // Build update object with only provided fields
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (category !== undefined) updateData.category = category;
      if (author !== undefined) updateData.author = author;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (published !== undefined) updateData.published = published;

      const news = await newsService.updateNews(id, updateData);

      logger.info(`News article updated successfully: ${id}`);

      // Send push notification only on first publish
      if (published === true && !wasPublishedBefore) {
        try {
          const notifResult = await notificationsService.sendNewsNotification(
            news._id.toString(),
            news.title,
            news.excerpt
          );
          logger.info(`Push notification sent for news ${news._id}: sent=${notifResult.sentCount ?? 0}, failed=${notifResult.failedCount ?? 0}`);
        } catch (notifError: any) {
          logger.error('Failed to send notification for news:', notifError);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          news: {
            id: news._id,
            title: news.title,
            content: news.content,
            excerpt: news.excerpt,
            category: news.category,
            author: news.author,
            imageUrl: news.imageUrl,
            published: news.published,
            publishedAt: news.publishedAt,
            createdAt: news.createdAt,
            updatedAt: news.updatedAt,
          },
          message: 'News article updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update news error:', error);
      next(error);
    }
  }

  /**
   * Delete a news article
   * DELETE /api/news/:id
   */
  async deleteNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ID exists
      if (!id || id === 'undefined' || id === 'null') {
        logger.warn('Delete attempt with missing or invalid ID', {
          id,
          params: req.params,
          url: req.url,
          user: req.user?.email,
        });
        
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'News ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate ID format (MongoDB ObjectId is 24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        logger.warn('Delete attempt with invalid ID format', {
          id,
          user: req.user?.email,
        });
        
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid news ID format',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Attempting to delete news article: ${id}`, {
        user: req.user?.email,
        role: req.user?.role,
        permissions: req.user?.permissions,
      });

      await newsService.deleteNews(id);

      logger.info(`News article deleted successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'News article deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete news error:', {
        id: req.params.id,
        error: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      });
      next(error);
    }
  }
}

export const newsController = new NewsController();
