import { Router } from 'express';
import { chatbotController } from './chatbot.controller';

const router = Router();

/**
 * POST /api/chatbot/query
 * Send a question to the chatbot and receive an AI-generated answer
 * No authentication required - accessible to mobile app users
 */
router.post('/query', chatbotController.query.bind(chatbotController));

/**
 * GET /api/chatbot/health
 * Check the health status of the chatbot service
 * No authentication required
 */
router.get('/health', chatbotController.health.bind(chatbotController));

export default router;
