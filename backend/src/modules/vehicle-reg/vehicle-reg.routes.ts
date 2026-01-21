import { Router } from 'express';
import { vehicleRegController } from './vehicle-reg.controller';
import { authenticate } from '../../middlewares/auth';
import { authenticateAppUser, optionalAuthenticateAppUser } from '../../middlewares/appAuth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadDocument } from '../../middlewares/upload';

const router = Router();

/**
 * @route   POST /api/vehicle-reg/applications
 * @desc    Create a new vehicle registration application
 * @access  Public (with optional auth for logged-in users)
 */
router.post(
  '/applications',
  optionalAuthenticateAppUser,
  uploadDocument.single('document'),
  vehicleRegController.createApplication.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/track/:referenceId/:pin
 * @desc    Track application by reference ID and PIN
 * @access  Public
 */
router.get(
  '/track/:referenceId/:pin',
  vehicleRegController.trackApplication.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/my-applications
 * @desc    Get user's vehicle registration applications by email (if authenticated)
 * @access  Private (requires authentication)
 */
router.get(
  '/my-applications',
  authenticateAppUser,
  vehicleRegController.getMyApplications.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/applications
 * @desc    List all applications (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get(
  '/applications',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.listApplications.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/applications/:id
 * @desc    Get application by ID (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get(
  '/applications/:id',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.getApplication.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/status
 * @desc    Update application status (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/status',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.updateStatus.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/payment
 * @desc    Mark payment as received (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/payment',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.markPaymentReceived.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/register
 * @desc    Mark as registered (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/register',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.markRegistered.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/dashboard/stats
 * @desc    Get dashboard statistics (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get(
  '/dashboard/stats',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.getDashboardStats.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/applications/:id/download-pdf
 * @desc    Download application form as PDF (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get(
  '/applications/:id/download-pdf',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.downloadPDF.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/comments
 * @desc    Update admin comments (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/comments',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.updateAdminComments.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/assign
 * @desc    Assign application to admin (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/assign',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.assignToAdmin.bind(vehicleRegController)
);

/**
 * @route   PUT /api/vehicle-reg/applications/:id/priority
 * @desc    Set application priority (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put(
  '/applications/:id/priority',
  authenticate,
  requirePermission('vehicle-reg:manage'),
  vehicleRegController.setPriority.bind(vehicleRegController)
);

/**
 * @route   GET /api/vehicle-reg/form
 * @desc    Download blank vehicle registration form PDF (public)
 * @access  Public
 */
router.get(
  '/form',
  vehicleRegController.downloadForm.bind(vehicleRegController)
);

export default router;
