import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { feedbackService } from './feedback.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class FeedbackController {
  /**
   * Submit feedback (public - mobile app)
   * POST /api/feedback
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, message, email } = req.body;
      if (!category || !message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Category and message are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const item = await feedbackService.create({
        category: String(category).trim(),
        message: message.trim(),
        email: email ? String(email).trim() : undefined,
      });
      res.status(201).json({
        success: true,
        data: {
          feedback: {
            id: item.id,
            category: item.category,
            message: item.message,
            email: item.email,
            status: item.status,
            createdAt: item.createdAt,
          },
          message: 'Feedback submitted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create feedback error:', error);
      next(error);
    }
  }

  /**
   * List feedback (admin)
   * GET /api/feedback
   */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await feedbackService.list({
        page,
        limit,
        category: category || undefined,
        status: status || undefined,
        search: search || undefined,
      });

      res.status(200).json({
        success: true,
        data: {
          feedback: result.feedback.map((f) => ({
            id: f.id,
            category: f.category,
            message: f.message,
            email: f.email,
            status: f.status,
            adminNotes: f.adminNotes,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
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
      logger.error('List feedback error:', error);
      next(error);
    }
  }

  /**
   * Get one feedback (admin)
   * GET /api/feedback/:id
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid feedback ID',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const item = await feedbackService.getById(id);
      res.status(200).json({
        success: true,
        data: {
          feedback: {
            id: item.id,
            category: item.category,
            message: item.message,
            email: item.email,
            status: item.status,
            adminNotes: item.adminNotes,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get feedback error:', error);
      next(error);
    }
  }

  /**
   * Update feedback status/notes (admin)
   * PATCH /api/feedback/:id
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid feedback ID',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const { status, adminNotes } = req.body;
      const updateData: { status?: string; adminNotes?: string } = {};
      if (status !== undefined) updateData.status = String(status).trim();
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes == null ? '' : String(adminNotes).trim();

      const item = await feedbackService.update(id, updateData);
      res.status(200).json({
        success: true,
        data: {
          feedback: {
            id: item.id,
            category: item.category,
            message: item.message,
            email: item.email,
            status: item.status,
            adminNotes: item.adminNotes,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          },
          message: 'Feedback updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update feedback error:', error);
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
