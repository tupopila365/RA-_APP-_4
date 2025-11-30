import { Router } from 'express';
import { locationsController } from './locations.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/locations
 * @desc    Create a new location
 * @access  Private (requires locations:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('locations:manage'),
  locationsController.createLocation.bind(locationsController)
);

/**
 * @route   GET /api/locations
 * @desc    List all locations with optional region filtering
 * @access  Public (mobile app users can view locations)
 * @query   region - Optional region filter
 */
router.get(
  '/',
  locationsController.listLocations.bind(locationsController)
);

/**
 * @route   GET /api/locations/:id
 * @desc    Get a single location by ID
 * @access  Public
 */
router.get(
  '/:id',
  locationsController.getLocation.bind(locationsController)
);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location
 * @access  Private (requires locations:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('locations:manage'),
  locationsController.updateLocation.bind(locationsController)
);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Private (requires locations:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('locations:manage'),
  locationsController.deleteLocation.bind(locationsController)
);

export default router;
