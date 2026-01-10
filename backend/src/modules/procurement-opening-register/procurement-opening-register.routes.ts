import { Router } from 'express';
import { procurementOpeningRegisterController } from './procurement-opening-register.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadMultiplePDFs, handleMultipleUploadError } from '../../middlewares/uploadMultiple';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

/**
 * @route   POST /api/procurement-opening-register
 * @desc    Create a new procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE),
  procurementOpeningRegisterController.createItem.bind(procurementOpeningRegisterController)
);

/**
 * @route   GET /api/procurement-opening-register
 * @desc    List all procurement opening register items with pagination, filtering, and search
 * @access  Public (mobile app users can view published items)
 */
router.get(
  '/',
  procurementOpeningRegisterController.listItems.bind(procurementOpeningRegisterController)
);

/**
 * @route   GET /api/procurement-opening-register/:id
 * @desc    Get a single procurement opening register item by ID
 * @access  Public (mobile app users can view published items)
 */
router.get(
  '/:id',
  procurementOpeningRegisterController.getItem.bind(procurementOpeningRegisterController)
);

/**
 * @route   PUT /api/procurement-opening-register/:id
 * @desc    Update a procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE),
  procurementOpeningRegisterController.updateItem.bind(procurementOpeningRegisterController)
);

/**
 * @route   DELETE /api/procurement-opening-register/:id
 * @desc    Delete a procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE),
  procurementOpeningRegisterController.deleteItem.bind(procurementOpeningRegisterController)
);

/**
 * @route   POST /api/procurement-opening-register/bulk-upload
 * @desc    Upload multiple notice documents (max 10 files)
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.post(
  '/bulk-upload',
  authenticate,
  requirePermission(PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE),
  uploadMultiplePDFs.array('files', 10),
  handleMultipleUploadError,
  procurementOpeningRegisterController.bulkUpload.bind(procurementOpeningRegisterController)
);

export default router;

