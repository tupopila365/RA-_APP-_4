import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { faqsService } from './faqs.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class FAQsController {
  /**
   * Create a new FAQ
   * POST /api/faqs
   */
  async createFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const { question, answer, category, order } = req.body;

      if (!question || !answer) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Question and answer are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create FAQ
      const faq = await faqsService.createFAQ({
        question,
        answer,
        category,
        order,
      });

      logger.info(`FAQ created successfully: ${faq.id}`);

      res.status(201).json({
        success: true,
        data: {
          faq: {
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
          },
          message: 'FAQ created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create FAQ error:', error);
      next(error);
    }
  }

  /**
   * List all FAQs with pagination, filtering, and search
   * GET /api/faqs
   */
  async listFAQs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await faqsService.listFAQs({
        page,
        limit,
        category,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          faqs: result.faqs.map((faq) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
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
      logger.error('List FAQs error:', error);
      next(error);
    }
  }

  /**
   * Get a single FAQ by ID
   * GET /api/faqs/:id
   */
  async getFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const faq = await faqsService.getFAQById(id);

      res.status(200).json({
        success: true,
        data: {
          faq: {
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get FAQ error:', error);
      next(error);
    }
  }

  /**
   * Update a FAQ
   * PUT /api/faqs/:id
   */
  async updateFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { question, answer, category, order } = req.body;

      // Build update object with only provided fields
      const updateData: any = {};
      if (question !== undefined) updateData.question = question;
      if (answer !== undefined) updateData.answer = answer;
      if (category !== undefined) updateData.category = category;
      if (order !== undefined) updateData.order = order;

      const faq = await faqsService.updateFAQ(id, updateData);

      logger.info(`FAQ updated successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          faq: {
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
          },
          message: 'FAQ updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update FAQ error:', error);
      next(error);
    }
  }

  /**
   * Delete a FAQ
   * DELETE /api/faqs/:id
   */
  async deleteFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
            message: 'FAQ ID is required',
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
            message: 'Invalid FAQ ID format',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Attempting to delete FAQ: ${id}`, {
        user: req.user?.email,
        role: req.user?.role,
        permissions: req.user?.permissions,
      });

      await faqsService.deleteFAQ(id);

      logger.info(`FAQ deleted successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'FAQ deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete FAQ error:', {
        id: req.params.id,
        error: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      });
      next(error);
    }
  }
}

export const faqsController = new FAQsController();

