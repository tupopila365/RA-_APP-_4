import { Router } from 'express';
import { faqsController } from './faqs.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/faqs
 * @desc    Create a new FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('faqs:manage'),
  faqsController.createFAQ.bind(faqsController)
);

/**
 * @route   GET /api/faqs
 * @desc    List all FAQs with pagination, filtering, and search
 * @access  Public (mobile app users can view FAQs)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   category - Filter by category
 * @query   search - Search in question and answer
 */
router.get(
  '/',
  faqsController.listFAQs.bind(faqsController)
);

/**
 * @route   GET /api/faqs/:id
 * @desc    Get a single FAQ by ID
 * @access  Public (mobile app users can view FAQs)
 */
router.get(
  '/:id',
  faqsController.getFAQ.bind(faqsController)
);

/**
 * @route   PUT /api/faqs/:id
 * @desc    Update a FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('faqs:manage'),
  faqsController.updateFAQ.bind(faqsController)
);

/**
 * @route   DELETE /api/faqs/:id
 * @desc    Delete a FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('faqs:manage'),
  faqsController.deleteFAQ.bind(faqsController)
);

export default router;

