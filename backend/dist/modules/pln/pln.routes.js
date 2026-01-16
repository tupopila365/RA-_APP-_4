"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pln_controller_1 = require("./pln.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const upload_1 = require("../../middlewares/upload");
// import { InputSanitizer } from '../../middlewares/inputSanitization';
// import { rateLimiters } from '../../middlewares/rateLimiting';
// import { CSRFProtection } from '../../middlewares/csrfProtection';
// import { SecureFileUpload } from '../../middlewares/secureFileUpload';
// import { CaptchaProtection } from '../../middlewares/captchaProtection';
// import { SecurityHeaders } from '../../middlewares/securityHeaders';
// import { AuditLogger } from '../../middlewares/auditLogger';
const router = (0, express_1.Router)();
// Apply security headers to all routes
// router.use(SecurityHeaders.setSecurityHeaders);
// Apply rate limiting to all PLN routes
// router.use(rateLimiters.general);
/**
 * @route   POST /api/pln/applications
 * @desc    Create a new PLN application
 * @access  Public (with comprehensive security protection)
 */
router.post('/applications', 
// rateLimiters.plnSubmission,
// CaptchaProtection.validateCaptcha,
// CSRFProtection.validateCSRF,
// SecureFileUpload.createPLNDocumentUpload().single('document'),
// SecureFileUpload.validateUploadedFile,
// InputSanitizer.sanitizePLNData,
// AuditLogger.logPLNSubmission,
upload_1.uploadDocument.single('document'), pln_controller_1.plnController.createApplication.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/csrf-token
 * @desc    Get CSRF token for form submission
 * @access  Public
 */
// router.get('/csrf-token', CSRFProtection.getTokenForClient);
/**
 * @route   GET /api/pln/track/:referenceId/:pin
 * @desc    Track application by reference ID and PIN (Universal PIN: 12345)
 * @access  Public (with rate limiting)
 */
router.get('/track/:referenceId/:pin', 
// rateLimiters.tracking,
pln_controller_1.plnController.trackApplication.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/applications
 * @desc    List all applications (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get('/applications', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.listApplications.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/applications/:id
 * @desc    Get application by ID (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get('/applications/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.getApplication.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/status
 * @desc    Update application status (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/status', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.updateStatus.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/payment
 * @desc    Mark payment as received (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/payment', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.markPaymentReceived.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/order-plates
 * @desc    Order plates (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/order-plates', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.orderPlates.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/ready
 * @desc    Mark ready for collection (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/ready', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.markReadyForCollection.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/dashboard/stats
 * @desc    Get dashboard statistics (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get('/dashboard/stats', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.getDashboardStats.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/applications/:id/download-pdf
 * @desc    Download application form as PDF (admin)
 * @access  Private (requires pln:manage permission)
 */
router.get('/applications/:id/download-pdf', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.downloadPDF.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/comments
 * @desc    Update admin comments (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/comments', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.updateAdminComments.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/assign
 * @desc    Assign application to admin (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/assign', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.assignToAdmin.bind(pln_controller_1.plnController));
/**
 * @route   PUT /api/pln/applications/:id/priority
 * @desc    Set application priority (admin)
 * @access  Private (requires pln:manage permission)
 */
router.put('/applications/:id/priority', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pln:manage'), pln_controller_1.plnController.setPriority.bind(pln_controller_1.plnController));
/**
 * @route   GET /api/pln/form
 * @desc    Download blank PLN form PDF (public)
 * @access  Public
 */
router.get('/form', pln_controller_1.plnController.downloadForm.bind(pln_controller_1.plnController));
exports.default = router;
//# sourceMappingURL=pln.routes.js.map