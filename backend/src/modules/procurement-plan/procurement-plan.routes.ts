import { Router } from 'express';
import { procurementPlanController } from './procurement-plan.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadMultiplePDFs, handleMultipleUploadError } from '../../middlewares/uploadMultiple';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

/**
 * @route   POST /api/procurement-plan
 * @desc    Create a new procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_PLAN_MANAGE),
  procurementPlanController.createPlan.bind(procurementPlanController)
);

/**
 * @route   GET /api/procurement-plan
 * @desc    List all procurement plans with pagination, filtering, and search
 * @access  Public (mobile app users can view published plans)
 */
router.get(
  '/',
  procurementPlanController.listPlans.bind(procurementPlanController)
);

/**
 * @route   GET /api/procurement-plan/:id
 * @desc    Get a single procurement plan by ID
 * @access  Public (mobile app users can view published plans)
 */
router.get(
  '/:id',
  procurementPlanController.getPlan.bind(procurementPlanController)
);

/**
 * @route   PUT /api/procurement-plan/:id
 * @desc    Update a procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_PLAN_MANAGE),
  procurementPlanController.updatePlan.bind(procurementPlanController)
);

/**
 * @route   DELETE /api/procurement-plan/:id
 * @desc    Delete a procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_PLAN_MANAGE),
  procurementPlanController.deletePlan.bind(procurementPlanController)
);

/**
 * @route   POST /api/procurement-plan/bulk-upload
 * @desc    Upload multiple procurement plans (max 10 files)
 * @access  Private (requires procurement:plan:manage permission)
 */
router.post(
  '/bulk-upload',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_PLAN_MANAGE),
  uploadMultiplePDFs.array('files', 10),
  handleMultipleUploadError,
  procurementPlanController.bulkUpload.bind(procurementPlanController)
);

export default router;

