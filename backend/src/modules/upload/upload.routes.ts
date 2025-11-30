import { Router } from 'express';
import { uploadController } from './upload.controller';
import { uploadImage, uploadPDF, handleUploadError } from '../../middlewares/upload';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { PERMISSIONS } from '../../constants/roles';

const router = Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.post(
  '/image',
  authenticate,
  requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD),
  uploadImage.single('image'),
  handleUploadError,
  uploadController.uploadImage.bind(uploadController)
);

/**
 * @route   POST /api/upload/pdf
 * @desc    Upload single PDF to Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.post(
  '/pdf',
  authenticate,
  requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD),
  uploadPDF.single('file'),
  handleUploadError,
  uploadController.uploadPDF.bind(uploadController)
);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.delete(
  '/image',
  authenticate,
  requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD),
  uploadController.deleteImage.bind(uploadController)
);

/**
 * @route   DELETE /api/upload/pdf
 * @desc    Delete PDF from Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.delete(
  '/pdf',
  authenticate,
  requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD),
  uploadController.deletePDF.bind(uploadController)
);

export default router;
