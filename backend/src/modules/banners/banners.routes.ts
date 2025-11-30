import { Router } from 'express';
import { bannersController } from './banners.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/banners
 * @desc    Create a new banner
 * @access  Private (requires banners:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('banners:manage'),
  bannersController.createBanner.bind(bannersController)
);

/**
 * @route   GET /api/banners
 * @desc    List all banners
 * @access  Public (mobile app users can view active banners)
 *          Private (admin users can view all banners)
 * @note    Returns only active banners for unauthenticated requests
 *          Returns all banners for authenticated admin requests
 */
router.get(
  '/',
  bannersController.listBanners.bind(bannersController)
);

/**
 * @route   GET /api/banners/:id
 * @desc    Get a single banner by ID
 * @access  Public
 */
router.get(
  '/:id',
  bannersController.getBanner.bind(bannersController)
);

/**
 * @route   PUT /api/banners/:id
 * @desc    Update a banner
 * @access  Private (requires banners:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('banners:manage'),
  bannersController.updateBanner.bind(bannersController)
);

/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete a banner
 * @access  Private (requires banners:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('banners:manage'),
  bannersController.deleteBanner.bind(bannersController)
);

export default router;
