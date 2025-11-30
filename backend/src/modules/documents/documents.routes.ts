import { Router } from 'express';
import { documentsController } from './documents.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { uploadPDF } from '../../middlewares/upload';

const router = Router();

/**
 * @route   POST /api/documents
 * @desc    Upload a new PDF document
 * @access  Private (requires documents:upload permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('documents:upload'),
  uploadPDF.single('file'),
  documentsController.uploadDocument.bind(documentsController)
);

/**
 * @route   GET /api/documents
 * @desc    List all documents with pagination and filtering
 * @access  Private (requires documents:upload permission)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   category - Filter by category (policy, tender, report, other)
 * @query   indexed - Filter by indexed status (true/false)
 * @query   search - Search in title and description
 */
router.get(
  '/',
  authenticate,
  requirePermission('documents:upload'),
  documentsController.listDocuments.bind(documentsController)
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document by ID
 * @access  Private (requires documents:upload permission)
 */
router.get(
  '/:id',
  authenticate,
  requirePermission('documents:upload'),
  documentsController.getDocument.bind(documentsController)
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private (requires documents:upload permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('documents:upload'),
  documentsController.deleteDocument.bind(documentsController)
);

/**
 * @route   GET /api/documents/:id/indexing-progress
 * @desc    Get indexing progress for a document
 * @access  Private (requires documents:upload permission)
 */
router.get(
  '/:id/indexing-progress',
  authenticate,
  requirePermission('documents:upload'),
  documentsController.getIndexingProgress.bind(documentsController)
);

export default router;
