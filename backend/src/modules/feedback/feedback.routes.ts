import { Router } from 'express';
import { feedbackController } from './feedback.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback (public - mobile app)
 * @access  Public
 */
router.post('/', feedbackController.create.bind(feedbackController));

/**
 * @route   GET /api/feedback
 * @desc    List feedback with pagination and filters
 * @access  Private (feedback:manage)
 */
router.get(
  '/',
  authenticate,
  requirePermission('feedback:manage'),
  feedbackController.list.bind(feedbackController)
);

/**
 * @route   GET /api/feedback/:id
 * @desc    Get single feedback
 * @access  Private (feedback:manage)
 */
router.get(
  '/:id',
  authenticate,
  requirePermission('feedback:manage'),
  feedbackController.getById.bind(feedbackController)
);

/**
 * @route   PATCH /api/feedback/:id
 * @desc    Update feedback (status, adminNotes)
 * @access  Private (feedback:manage)
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission('feedback:manage'),
  feedbackController.update.bind(feedbackController)
);

export default router;
