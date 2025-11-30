"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("./news.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/news
 * @desc    Create a new news article
 * @access  Private (requires news:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('news:manage'), news_controller_1.newsController.createNews.bind(news_controller_1.newsController));
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
router.get('/', news_controller_1.newsController.listNews.bind(news_controller_1.newsController));
/**
 * @route   GET /api/news/:id
 * @desc    Get a single news article by ID
 * @access  Public (mobile app users can view published news)
 */
router.get('/:id', news_controller_1.newsController.getNews.bind(news_controller_1.newsController));
/**
 * @route   PUT /api/news/:id
 * @desc    Update a news article
 * @access  Private (requires news:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('news:manage'), news_controller_1.newsController.updateNews.bind(news_controller_1.newsController));
/**
 * @route   DELETE /api/news/:id
 * @desc    Delete a news article
 * @access  Private (requires news:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('news:manage'), news_controller_1.newsController.deleteNews.bind(news_controller_1.newsController));
exports.default = router;
//# sourceMappingURL=news.routes.js.map