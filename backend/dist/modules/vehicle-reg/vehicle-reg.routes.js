"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_reg_controller_1 = require("./vehicle-reg.controller");
const auth_1 = require("../../middlewares/auth");
const appAuth_1 = require("../../middlewares/appAuth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/vehicle-reg/applications
 * @desc    Create a new vehicle registration application
 * @access  Public (with optional auth for logged-in users)
 */
router.post('/applications', appAuth_1.optionalAuthenticateAppUser, upload_1.uploadDocument.single('document'), vehicle_reg_controller_1.vehicleRegController.createApplication.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/track/:referenceId/:pin
 * @desc    Track application by reference ID and PIN
 * @access  Public
 */
router.get('/track/:referenceId/:pin', vehicle_reg_controller_1.vehicleRegController.trackApplication.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/my-applications
 * @desc    Get user's vehicle registration applications by email (if authenticated)
 * @access  Private (requires authentication)
 */
router.get('/my-applications', appAuth_1.authenticateAppUser, vehicle_reg_controller_1.vehicleRegController.getMyApplications.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/applications
 * @desc    List all applications (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get('/applications', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.listApplications.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/applications/:id
 * @desc    Get application by ID (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get('/applications/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.getApplication.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/status
 * @desc    Update application status (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/status', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.updateStatus.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/payment
 * @desc    Mark payment as received (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/payment', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.markPaymentReceived.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/register
 * @desc    Mark as registered (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/register', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.markRegistered.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/dashboard/stats
 * @desc    Get dashboard statistics (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get('/dashboard/stats', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.getDashboardStats.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/applications/:id/download-pdf
 * @desc    Download application form as PDF (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.get('/applications/:id/download-pdf', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.downloadPDF.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/comments
 * @desc    Update admin comments (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/comments', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.updateAdminComments.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/assign
 * @desc    Assign application to admin (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/assign', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.assignToAdmin.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   PUT /api/vehicle-reg/applications/:id/priority
 * @desc    Set application priority (admin)
 * @access  Private (requires vehicle-reg:manage permission)
 */
router.put('/applications/:id/priority', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vehicle-reg:manage'), vehicle_reg_controller_1.vehicleRegController.setPriority.bind(vehicle_reg_controller_1.vehicleRegController));
/**
 * @route   GET /api/vehicle-reg/form
 * @desc    Download blank vehicle registration form PDF (public)
 * @access  Public
 */
router.get('/form', vehicle_reg_controller_1.vehicleRegController.downloadForm.bind(vehicle_reg_controller_1.vehicleRegController));
exports.default = router;
//# sourceMappingURL=vehicle-reg.routes.js.map