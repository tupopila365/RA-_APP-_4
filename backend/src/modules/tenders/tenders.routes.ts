import { Router } from 'express';
import { tendersController } from './tenders.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/tenders
 * @desc    Create a new tender
 * @access  Private (requires tenders:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('tenders:manage'),
  tendersController.createTender.bind(tendersController)
);

/**
 * @route   GET /api/tenders
 * @desc    List all tenders with pagination, filtering, and search
 * @access  Public (mobile app users can view published tenders)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   status - Filter by tender status (open, closed, upcoming)
 * @query   category - Filter by category
 * @query   published - Filter by published status (true/false)
 * @query   search - Search in title and description
 */
router.get(
  '/',
  tendersController.listTenders.bind(tendersController)
);

/**
 * @route   GET /api/tenders/:id
 * @desc    Get a single tender by ID
 * @access  Public (mobile app users can view published tenders)
 */
router.get(
  '/:id',
  tendersController.getTender.bind(tendersController)
);

/**
 * @route   PUT /api/tenders/:id
 * @desc    Update a tender
 * @access  Private (requires tenders:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('tenders:manage'),
  tendersController.updateTender.bind(tendersController)
);

/**
 * @route   DELETE /api/tenders/:id
 * @desc    Delete a tender
 * @access  Private (requires tenders:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('tenders:manage'),
  tendersController.deleteTender.bind(tendersController)
);

export default router;
