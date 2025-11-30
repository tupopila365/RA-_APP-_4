import { Router } from 'express';
import { newsController } from './news.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/news
 * @desc    Create a new news article
 * @access  Private (requires news:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('news:manage'),
  newsController.createNews.bind(newsController)
);

/**
 * @route   GET /api/news
 * @desc    List all news articles with pagination, filtering, and search
 * @access  Public (mobile app users can view published news)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   category - Filter by category
 * @query   published - Filter by published status (true/false)
 * @query   search - Search in title, content, and excerpt
 */
router.get(
  '/',
  newsController.listNews.bind(newsController)
);

/**
 * @route   GET /api/news/:id
 * @desc    Get a single news article by ID
 * @access  Public (mobile app users can view published news)
 */
router.get(
  '/:id',
  newsController.getNews.bind(newsController)
);

/**
 * @route   PUT /api/news/:id
 * @desc    Update a news article
 * @access  Private (requires news:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('news:manage'),
  newsController.updateNews.bind(newsController)
);

/**
 * @route   DELETE /api/news/:id
 * @desc    Delete a news article
 * @access  Private (requires news:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('news:manage'),
  newsController.deleteNews.bind(newsController)
);

export default router;
