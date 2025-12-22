import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public route - no authentication required for token registration
router.post('/register', notificationsController.registerToken.bind(notificationsController));

// Protected routes - require authentication
router.use(authenticate);

router.post('/send', notificationsController.sendNotification.bind(notificationsController));
router.get('/logs', notificationsController.getNotificationLogs.bind(notificationsController));
router.get('/stats', notificationsController.getStats.bind(notificationsController));
router.get('/tokens', notificationsController.getTokens.bind(notificationsController));

export default router;

