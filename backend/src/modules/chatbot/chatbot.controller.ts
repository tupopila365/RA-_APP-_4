import { Request, Response, NextFunction } from 'express';
import { chatbotService, ChatbotQueryRequest } from './chatbot.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

class ChatbotController {
  /**
   * Handle chatbot query request
   * POST /api/chatbot/query
   */
  async query(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, sessionId } = req.body;

      // Validate input
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_INVALID_INPUT,
            message: 'Question is required and must be a non-empty string',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate question length (max 1000 characters)
      if (question.length > 1000) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_INVALID_INPUT,
            message: 'Question must not exceed 1000 characters',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const queryRequest: ChatbotQueryRequest = {
        question: question.trim(),
        sessionId,
      };

      // Process query through chatbot service
      const response = await chatbotService.processQuery(queryRequest);

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Chatbot query controller error:', error);
      next(error);
    }
  }

  /**
   * Health check endpoint for chatbot service
   * GET /api/chatbot/health
   */
  async health(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthStatus = await chatbotService.healthCheck();

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: healthStatus.status === 'healthy',
        data: healthStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Chatbot health check controller error:', error);
      next(error);
    }
  }
}

export const chatbotController = new ChatbotController();
