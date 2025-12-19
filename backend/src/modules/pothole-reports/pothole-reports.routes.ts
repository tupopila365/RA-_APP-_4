import { Router } from 'express';
import { potholeReportsController } from './pothole-reports.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadImage } from '../../middlewares/upload';

const router = Router();

/**
 * @route   POST /api/pothole-reports
 * @desc    Create a new pothole report
 * @access  Public (requires X-Device-ID header)
 */
router.post(
  '/',
  uploadImage.single('photo'),
  potholeReportsController.createReport.bind(potholeReportsController)
);

/**
 * @route   GET /api/pothole-reports/my-reports
 * @desc    Get user's reports by device ID
 * @access  Public (requires X-Device-ID header)
 */
router.get(
  '/my-reports',
  potholeReportsController.getMyReports.bind(potholeReportsController)
);

/**
 * @route   GET /api/pothole-reports/:id
 * @desc    Get a single report by ID
 * @access  Public
 */
router.get(
  '/:id',
  potholeReportsController.getReport.bind(potholeReportsController)
);

/**
 * @route   GET /api/pothole-reports
 * @desc    List all reports with filtering (admin)
 * @access  Private (requires pothole-reports:manage permission)
 */
router.get(
  '/',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.listReports.bind(potholeReportsController)
);

/**
 * @route   PUT /api/pothole-reports/:id/status
 * @desc    Update report status
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put(
  '/:id/status',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.updateReportStatus.bind(potholeReportsController)
);

/**
 * @route   PUT /api/pothole-reports/:id/assign
 * @desc    Assign report to maintenance team
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put(
  '/:id/assign',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.assignReport.bind(potholeReportsController)
);

/**
 * @route   PUT /api/pothole-reports/:id/notes
 * @desc    Add admin notes to report
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put(
  '/:id/notes',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.addAdminNotes.bind(potholeReportsController)
);

/**
 * @route   PUT /api/pothole-reports/:id/fixed
 * @desc    Mark report as fixed (with optional repair photo)
 * @access  Private (requires pothole-reports:manage permission)
 */
router.put(
  '/:id/fixed',
  authenticate,
  requirePermission('pothole-reports:manage'),
  uploadImage.single('repairPhoto'),
  potholeReportsController.markAsFixed.bind(potholeReportsController)
);

/**
 * @route   DELETE /api/pothole-reports/:id
 * @desc    Delete a report
 * @access  Private (requires pothole-reports:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.deleteReport.bind(potholeReportsController)
);

/**
 * @route   GET /api/pothole-reports/filters/regions-towns
 * @desc    Get unique regions and towns for filtering
 * @access  Private (requires pothole-reports:manage permission)
 */
router.get(
  '/filters/regions-towns',
  authenticate,
  requirePermission('pothole-reports:manage'),
  potholeReportsController.getRegionsAndTowns.bind(potholeReportsController)
);

export default router;

