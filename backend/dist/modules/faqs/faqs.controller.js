"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsController = exports.FAQsController = void 0;
const faqs_service_1 = require("./faqs.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class FAQsController {
    /**
     * Create a new FAQ
     * POST /api/faqs
     */
    async createFAQ(req, res, next) {
        try {
            // Validate required fields
            const { question, answer, category, order } = req.body;
            if (!question || !answer) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Question and answer are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Create FAQ
            const faq = await faqs_service_1.faqsService.createFAQ({
                question,
                answer,
                category,
                order,
            });
            logger_1.logger.info(`FAQ created successfully: ${faq._id}`);
            res.status(201).json({
                success: true,
                data: {
                    faq: {
                        id: faq._id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        order: faq.order,
                        createdAt: faq.createdAt,
                        updatedAt: faq.updatedAt,
                    },
                    message: 'FAQ created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create FAQ error:', error);
            next(error);
        }
    }
    /**
     * List all FAQs with pagination, filtering, and search
     * GET /api/faqs
     */
    async listFAQs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const search = req.query.search;
            const result = await faqs_service_1.faqsService.listFAQs({
                page,
                limit,
                category,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    faqs: result.faqs.map((faq) => ({
                        id: faq._id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        order: faq.order,
                        createdAt: faq.createdAt,
                        updatedAt: faq.updatedAt,
                    })),
                    pagination: {
                        total: result.total,
                        page: result.page,
                        totalPages: result.totalPages,
                        limit,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('List FAQs error:', error);
            next(error);
        }
    }
    /**
     * Get a single FAQ by ID
     * GET /api/faqs/:id
     */
    async getFAQ(req, res, next) {
        try {
            const { id } = req.params;
            const faq = await faqs_service_1.faqsService.getFAQById(id);
            res.status(200).json({
                success: true,
                data: {
                    faq: {
                        id: faq._id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        order: faq.order,
                        createdAt: faq.createdAt,
                        updatedAt: faq.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get FAQ error:', error);
            next(error);
        }
    }
    /**
     * Update a FAQ
     * PUT /api/faqs/:id
     */
    async updateFAQ(req, res, next) {
        try {
            const { id } = req.params;
            const { question, answer, category, order } = req.body;
            // Build update object with only provided fields
            const updateData = {};
            if (question !== undefined)
                updateData.question = question;
            if (answer !== undefined)
                updateData.answer = answer;
            if (category !== undefined)
                updateData.category = category;
            if (order !== undefined)
                updateData.order = order;
            const faq = await faqs_service_1.faqsService.updateFAQ(id, updateData);
            logger_1.logger.info(`FAQ updated successfully: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    faq: {
                        id: faq._id,
                        question: faq.question,
                        answer: faq.answer,
                        category: faq.category,
                        order: faq.order,
                        createdAt: faq.createdAt,
                        updatedAt: faq.updatedAt,
                    },
                    message: 'FAQ updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update FAQ error:', error);
            next(error);
        }
    }
    /**
     * Delete a FAQ
     * DELETE /api/faqs/:id
     */
    async deleteFAQ(req, res, next) {
        try {
            const { id } = req.params;
            // Validate ID exists
            if (!id || id === 'undefined' || id === 'null') {
                logger_1.logger.warn('Delete attempt with missing or invalid ID', {
                    id,
                    params: req.params,
                    url: req.url,
                    user: req.user?.email,
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'FAQ ID is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate ID format (MongoDB ObjectId is 24 hex characters)
            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                logger_1.logger.warn('Delete attempt with invalid ID format', {
                    id,
                    user: req.user?.email,
                });
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Invalid FAQ ID format',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            logger_1.logger.info(`Attempting to delete FAQ: ${id}`, {
                user: req.user?.email,
                role: req.user?.role,
                permissions: req.user?.permissions,
            });
            await faqs_service_1.faqsService.deleteFAQ(id);
            logger_1.logger.info(`FAQ deleted successfully: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'FAQ deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete FAQ error:', {
                id: req.params.id,
                error: error.message,
                stack: error.stack,
                statusCode: error.statusCode,
            });
            next(error);
        }
    }
}
exports.FAQsController = FAQsController;
exports.faqsController = new FAQsController();
//# sourceMappingURL=faqs.controller.js.map