import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { interactionsService, UpdateFeedbackDTO, ListInteractionsQuery } from './interactions.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

class InteractionsController {
  /**
   * Update feedback for an interaction
   * PUT /api/chatbot/interactions/:id/feedback
   * Public endpoint (no auth required for mobile app users)
   */
  async updateFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { feedback, comment } = req.body;

      // Validate feedback value
      if (!feedback || !['like', 'dislike'].includes(feedback)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Feedback must be either "like" or "dislike"',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate comment length if provided
      if (comment && comment.length > 1000) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Comment must not exceed 1000 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: UpdateFeedbackDTO = {
        feedback: feedback as 'like' | 'dislike',
        comment: comment || undefined,
      };

      const interaction = await interactionsService.updateFeedback(id, updateData);

      logger.info(`Feedback updated for interaction ${id}`, { feedback });

      res.status(200).json({
        success: true,
        data: {
          interaction: {
            id: interaction.id,
            question: interaction.question,
            answer: interaction.answer,
            feedback: interaction.feedback,
            comment: interaction.comment,
            timestamp: interaction.timestamp,
            sessionId: interaction.sessionId,
            category: interaction.category,
            updatedAt: interaction.updatedAt,
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

  /**
   * List interactions with filtering and pagination
   * GET /api/chatbot/interactions
   * Admin only endpoint
   */
  async listInteractions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const feedback = req.query.feedback as 'like' | 'dislike' | undefined;
      const category = req.query.category as string;
      const sessionId = req.query.sessionId as string;

      // Parse date filters
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid startDate format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid endDate format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const query: ListInteractionsQuery = {
        page,
        limit,
        feedback,
        category,
        sessionId,
        startDate,
        endDate,
      };

      const result = await interactionsService.getInteractions(query);

      res.status(200).json({
        success: true,
        data: {
          interactions: result.interactions.map((interaction) => ({
            id: interaction.id,
            question: interaction.question,
            answer: interaction.answer,
            feedback: interaction.feedback,
            comment: interaction.comment,
            timestamp: interaction.timestamp,
            sessionId: interaction.sessionId,
            category: interaction.category,
            createdAt: interaction.createdAt,
            updatedAt: interaction.updatedAt,
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
      logger.error('List interactions error:', error);
      next(error);
    }
  }

  /**
   * Get metrics and statistics
   * GET /api/chatbot/interactions/metrics
   * Admin only endpoint
   */
  async getMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse optional date filters
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
        if (isNaN(startDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid startDate format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
        if (isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid endDate format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const metrics = await interactionsService.getMetrics(startDate, endDate);

      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get metrics error:', error);
      next(error);
    }
  }
}

export const interactionsController = new InteractionsController();




























