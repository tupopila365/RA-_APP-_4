import { Request, Response, NextFunction } from 'express';
import { chatbotService, ChatbotQueryRequest } from './chatbot.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import axios from 'axios';
import { env } from '../../config/env';

class ChatbotController {
  /**
   * Handle chatbot query request with streaming
   * POST /api/chatbot/query/stream
   */
  async queryStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question } = req.body;

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

      // Validate question length
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

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Forward streaming request to RAG service
      const ragResponse = await axios.post(
        `${env.RAG_SERVICE_URL}/api/query/stream`,
        { question: question.trim(), top_k: 5 },
        {
          responseType: 'stream',
          timeout: 120000, // 2 minutes
        }
      );

      // Pipe the stream from RAG service to client
      ragResponse.data.pipe(res);

      ragResponse.data.on('error', (error: any) => {
        logger.error('RAG streaming error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Streaming error occurred' })}\n\n`);
        res.end();
      });

    } catch (error: any) {
      logger.error('Chatbot stream controller error:', error);
      
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: {
            code: ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
            message: 'Failed to stream chatbot response',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

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
