import { Router } from 'express';
import { interactionsController } from './interactions.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

/**
 * PUT /api/chatbot/interactions/:id/feedback
 * Update feedback for an interaction
 * Public endpoint (no authentication required for mobile app users)
 */
router.put('/:id/feedback', interactionsController.updateFeedback.bind(interactionsController));

/**
 * GET /api/chatbot/interactions
 * List interactions with filtering and pagination
 * Admin only endpoint
 */
router.get('/', authenticate, interactionsController.listInteractions.bind(interactionsController));

/**
 * GET /api/chatbot/interactions/metrics
 * Get metrics and statistics
 * Admin only endpoint
 */
router.get('/metrics', authenticate, interactionsController.getMetrics.bind(interactionsController));

export default router;





















