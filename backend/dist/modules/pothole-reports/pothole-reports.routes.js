"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pothole_reports_controller_1 = require("./pothole-reports.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/pothole-reports
 * @desc    Create a new pothole report
 * @access  Public (requires X-Device-ID header)
 */
router.post('/', upload_1.uploadImage.single('photo'), pothole_reports_controller_1.potholeReportsController.createReport.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   GET /api/pothole-reports/my-reports
 * @desc    Get user's reports by device ID
 * @access  Public (requires X-Device-ID header)
 */
router.get('/my-reports', pothole_reports_controller_1.potholeReportsController.getMyReports.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   GET /api/pothole-reports/:id
 * @desc    Get a single report by ID
 * @access  Public
 */
router.get('/:id', pothole_reports_controller_1.potholeReportsController.getReport.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   GET /api/pothole-reports
 * @desc    List all reports with filtering (admin)
 * @access  Private (requires pothole-reports:manage permission)
 */
router.get('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.listReports.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   PUT /api/pothole-reports/:id/status
 * @desc    Update report status
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put('/:id/status', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.updateReportStatus.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   PUT /api/pothole-reports/:id/assign
 * @desc    Assign report to maintenance team
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put('/:id/assign', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.assignReport.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   PUT /api/pothole-reports/:id/notes
 * @desc    Add admin notes to report
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put('/:id/notes', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.addAdminNotes.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   PUT /api/pothole-reports/:id/fixed
 * @desc    Mark report as fixed (with optional repair photo)
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put('/:id/fixed', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), upload_1.uploadImage.single('repairPhoto'), pothole_reports_controller_1.potholeReportsController.markAsFixed.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   DELETE /api/pothole-reports/:id
 * @desc    Delete a report
 * @access  Private (requires pothole-reports:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.deleteReport.bind(pothole_reports_controller_1.potholeReportsController));
/**
 * @route   GET /api/pothole-reports/filters/regions-towns
 * @desc    Get unique regions and towns for filtering
 * @access  Private (requires pothole-reports:manage permission)
 */
router.get('/filters/regions-towns', auth_1.authenticate, (0, roleGuard_1.requirePermission)('pothole-reports:manage'), pothole_reports_controller_1.potholeReportsController.getRegionsAndTowns.bind(pothole_reports_controller_1.potholeReportsController));
exports.default = router;
//# sourceMappingURL=pothole-reports.routes.js.map