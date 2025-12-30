import { Router } from 'express';
import { plnController } from './pln.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadDocument } from '../../middlewares/upload';

const router = Router();

/**
 * @route   POST /api/pln/applications
 * @desc    Create a new PLN application
 * @access  Public
 */
router.post(
  '/applications',
  uploadDocument.single('document'),
  plnController.createApplication.bind(plnController)
);

/**
 * @route   GET /api/pln/track/:referenceId/:idNumber
 * @desc    Track application by reference ID and ID number
 * @access  Public
 */
router.get(
  '/track/:referenceId/:idNumber',
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

export default router;


