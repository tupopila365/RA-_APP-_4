import { Router } from 'express';
import { procurementAwardController } from './procurement-awards.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadMultiplePDFs, handleMultipleUploadError } from '../../middlewares/uploadMultiple';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

/**
 * @route   POST /api/procurement-awards
 * @desc    Create a new procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_AWARDS_MANAGE),
  procurementAwardController.createAward.bind(procurementAwardController)
);

/**
 * @route   GET /api/procurement-awards
 * @desc    List all procurement awards with pagination, filtering, and search
 * @access  Public (mobile app users can view published awards)
 */
router.get(
  '/',
  procurementAwardController.listAwards.bind(procurementAwardController)
);

/**
 * @route   GET /api/procurement-awards/:id
 * @desc    Get a single procurement award by ID
 * @access  Public (mobile app users can view published awards)
 */
router.get(
  '/:id',
  procurementAwardController.getAward.bind(procurementAwardController)
);

/**
 * @route   PUT /api/procurement-awards/:id
 * @desc    Update a procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_AWARDS_MANAGE),
  procurementAwardController.updateAward.bind(procurementAwardController)
);

/**
 * @route   DELETE /api/procurement-awards/:id
 * @desc    Delete a procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_AWARDS_MANAGE),
  procurementAwardController.deleteAward.bind(procurementAwardController)
);

/**
 * @route   POST /api/procurement-awards/bulk-upload
 * @desc    Upload multiple executive summary documents (max 10 files)
 * @access  Private (requires procurement:awards:manage permission)
 */
router.post(
  '/bulk-upload',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_AWARDS_MANAGE),
  uploadMultiplePDFs.array('files', 10),
  handleMultipleUploadError,
  procurementAwardController.bulkUpload.bind(procurementAwardController)
);

export default router;

