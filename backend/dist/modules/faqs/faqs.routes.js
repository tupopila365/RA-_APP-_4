"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faqs_controller_1 = require("./faqs.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/faqs
 * @desc    Create a new FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('faqs:manage'), faqs_controller_1.faqsController.createFAQ.bind(faqs_controller_1.faqsController));
/**
 * @route   GET /api/faqs
 * @desc    List all FAQs with pagination, filtering, and search
 * @access  Public (mobile app users can view FAQs)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   category - Filter by category
 * @query   search - Search in question and answer
 */
router.get('/', faqs_controller_1.faqsController.listFAQs.bind(faqs_controller_1.faqsController));
/**
 * @route   GET /api/faqs/:id
 * @desc    Get a single FAQ by ID
 * @access  Public (mobile app users can view FAQs)
 */
router.get('/:id', faqs_controller_1.faqsController.getFAQ.bind(faqs_controller_1.faqsController));
/**
 * @route   PUT /api/faqs/:id
 * @desc    Update a FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('faqs:manage'), faqs_controller_1.faqsController.updateFAQ.bind(faqs_controller_1.faqsController));
/**
 * @route   DELETE /api/faqs/:id
 * @desc    Delete a FAQ
 * @access  Private (requires faqs:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('faqs:manage'), faqs_controller_1.faqsController.deleteFAQ.bind(faqs_controller_1.faqsController));
exports.default = router;
//# sourceMappingURL=faqs.routes.js.map