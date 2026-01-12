import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Track chatbot interaction
router.post('/chatbot', analyticsController.trackInteraction);

// Track user feedback
router.post('/feedback', analyticsController.trackFeedback);

// Get analytics summary
router.get('/summary', analyticsController.getAnalyticsSummary);

// Get improvement recommendations
router.get('/recommendations', analyticsController.getRecommendations);

// Get real-time metrics
router.get('/realtime', analyticsController.getRealtimeMetrics);

export default router;