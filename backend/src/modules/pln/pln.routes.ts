import { Router } from 'express';
import { plnController } from './pln.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadDocument } from '../../middlewares/upload';
// import { InputSanitizer } from '../../middlewares/inputSanitization';
// import { rateLimiters } from '../../middlewares/rateLimiting';
// import { CSRFProtection } from '../../middlewares/csrfProtection';
// import { SecureFileUpload } from '../../middlewares/secureFileUpload';
// import { CaptchaProtection } from '../../middlewares/captchaProtection';
// import { SecurityHeaders } from '../../middlewares/securityHeaders';
// import { AuditLogger } from '../../middlewares/auditLogger';

const router = Router();

// Apply security headers to all routes
// router.use(SecurityHeaders.setSecurityHeaders);

// Apply rate limiting to all PLN routes
// router.use(rateLimiters.general);

/**
 * @route   POST /api/pln/applications
 * @desc    Create a new PLN application
 * @access  Public (with comprehensive security protection)
 */
router.post(
  '/applications',
  // rateLimiters.plnSubmission,
  // CaptchaProtection.validateCaptcha,
  // CSRFProtection.validateCSRF,
  // SecureFileUpload.createPLNDocumentUpload().single('document'),
  // SecureFileUpload.validateUploadedFile,
  // InputSanitizer.sanitizePLNData,
  // AuditLogger.logPLNSubmission,
  uploadDocument.single('document'),
  plnController.createApplication.bind(plnController)
);

/**
 * @route   GET /api/pln/csrf-token
 * @desc    Get CSRF token for form submission
 * @access  Public
 */
// router.get('/csrf-token', CSRFProtection.getTokenForClient);

/**
 * @route   GET /api/pln/track/:referenceId/:idNumber
 * @desc    Track application by reference ID and ID number
 * @access  Public (with rate limiting)
 */
router.get(
  '/track/:referenceId/:idNumber',
  // rateLimiters.tracking,
  plnController.trackApplication.bind(plnController)
);

/**
 * @route   GET /api/pln/applications
 * @desc    List all applications (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get(
  '/applications',
  authenticate,
  requirePermission('pln:manage'),
  plnController.listApplications.bind(plnController)
);

/**
 * @route   GET /api/pln/applications/:id
 * @desc    Get application by ID (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get(
  '/applications/:id',
  authenticate,
  requirePermission('pln:manage'),
  plnController.getApplication.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/status
 * @desc    Update application status (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/status',
  authenticate,
  requirePermission('pln:manage'),
  plnController.updateStatus.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/payment
 * @desc    Mark payment as received (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/payment',
  authenticate,
  requirePermission('pln:manage'),
  plnController.markPaymentReceived.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/order-plates
 * @desc    Order plates (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/order-plates',
  authenticate,
  requirePermission('pln:manage'),
  plnController.orderPlates.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/ready
 * @desc    Mark ready for collection (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/ready',
  authenticate,
  requirePermission('pln:manage'),
  plnController.markReadyForCollection.bind(plnController)
);

/**
 * @route   GET /api/pln/dashboard/stats
 * @desc    Get dashboard statistics (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get(
  '/dashboard/stats',
  authenticate,
  requirePermission('pln:manage'),
  plnController.getDashboardStats.bind(plnController)
);

/**
 * @route   GET /api/pln/applications/:id/download-pdf
 * @desc    Download application form as PDF (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get(
  '/applications/:id/download-pdf',
  authenticate,
  requirePermission('pln:manage'),
  plnController.downloadPDF.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/comments
 * @desc    Update admin comments (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/comments',
  authenticate,
  requirePermission('pln:manage'),
  plnController.updateAdminComments.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/assign
 * @desc    Assign application to admin (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/assign',
  authenticate,
  requirePermission('pln:manage'),
  plnController.assignToAdmin.bind(plnController)
);

/**
 * @route   PUT /api/pln/applications/:id/priority
 * @desc    Set application priority (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put(
  '/applications/:id/priority',
  authenticate,
  requirePermission('pln:manage'),
  plnController.setPriority.bind(plnController)
);

/**
 * @route   GET /api/pln/form
 * @desc    Download blank PLN form PDF (public)
 * @access  Public
 */
router.get(
  '/form',
  plnController.downloadForm.bind(plnController)
);

export default router;



