import { Router } from 'express';
import { procurementLegislationController } from './procurement-legislation.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadMultiplePDFs, handleMultipleUploadError } from '../../middlewares/uploadMultiple';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

/**
 * @route   POST /api/procurement-legislation
 * @desc    Create a new procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE),
  procurementLegislationController.createLegislation.bind(procurementLegislationController)
);

/**
 * @route   GET /api/procurement-legislation
 * @desc    List all procurement legislation documents with pagination, filtering, and search
 * @access  Public (mobile app users can view published documents)
 */
router.get(
  '/',
  procurementLegislationController.listLegislation.bind(procurementLegislationController)
);

/**
 * @route   GET /api/procurement-legislation/:id
 * @desc    Get a single procurement legislation document by ID
 * @access  Public (mobile app users can view published documents)
 */
router.get(
  '/:id',
  procurementLegislationController.getLegislation.bind(procurementLegislationController)
);

/**
 * @route   PUT /api/procurement-legislation/:id
 * @desc    Update a procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE),
  procurementLegislationController.updateLegislation.bind(procurementLegislationController)
);

/**
 * @route   DELETE /api/procurement-legislation/:id
 * @desc    Delete a procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE),
  procurementLegislationController.deleteLegislation.bind(procurementLegislationController)
);

/**
 * @route   POST /api/procurement-legislation/bulk-upload
 * @desc    Upload multiple procurement legislation documents (max 10 files)
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.post(
  '/bulk-upload',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE),
  uploadMultiplePDFs.array('files', 10),
  handleMultipleUploadError,
  procurementLegislationController.bulkUpload.bind(procurementLegislationController)
);

export default router;

