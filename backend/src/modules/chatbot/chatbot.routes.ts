import { Router } from 'express';
import { chatbotController } from './chatbot.controller';
import interactionsRoutes from './interactions.routes';

const router = Router();

/**
 * POST /api/chatbot/query
 * Send a question to the chatbot and receive an AI-generated answer
 * No authentication required - accessible to mobile app users
 */
router.post('/query', chatbotController.query.bind(chatbotController));

/**
 * POST /api/chatbot/query/stream
 * Send a question to the chatbot and receive a streaming response
 * No authentication required - accessible to mobile app users
 */
router.post('/query/stream', chatbotController.queryStream.bind(chatbotController));

/**
 * GET /api/chatbot/health
 * Check the health status of the chatbot service
 * No authentication required
 */
router.get('/health', chatbotController.health.bind(chatbotController));

/**
 * Interactions routes
 * /api/chatbot/interactions/*
 */
router.use('/interactions', interactionsRoutes);

export default router;
