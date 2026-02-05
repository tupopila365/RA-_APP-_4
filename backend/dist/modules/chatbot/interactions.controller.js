"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionsController = void 0;
const interactions_service_1 = require("./interactions.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class InteractionsController {
    /**
     * Update feedback for an interaction
     * PUT /api/chatbot/interactions/:id/feedback
     * Public endpoint (no auth required for mobile app users)
     */
    async updateFeedback(req, res, next) {
        try {
            const { id } = req.params;
            const { feedback, comment } = req.body;
            // Validate feedback value
            if (!feedback || !['like', 'dislike'].includes(feedback)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Feedback must be either "like" or "dislike"',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate comment length if provided
            if (comment && comment.length > 1000) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Comment must not exceed 1000 characters',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const updateData = {
                feedback: feedback,
                comment: comment || undefined,
            };
            const interaction = await interactions_service_1.interactionsService.updateFeedback(id, updateData);
            logger_1.logger.info(`Feedback updated for interaction ${id}`, { feedback });
            res.status(200).json({
                success: true,
                data: {
                    interaction: {
                        id: interaction.id,
                        question: interaction.question,
                        answer: interaction.answer,
                        feedback: interaction.feedback,
                        comment: interaction.comment,
                        timestamp: interaction.timestamp,
                        sessionId: interaction.sessionId,
                        category: interaction.category,
                        updatedAt: interaction.updatedAt,
                    },
                    message: 'Feedback updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update feedback error:', error);
            next(error);
        }
    }
    /**
     * List interactions with filtering and pagination
     * GET /api/chatbot/interactions
     * Admin only endpoint
     */
    async listInteractions(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const feedback = req.query.feedback;
            const category = req.query.category;
            const sessionId = req.query.sessionId;
            // Parse date filters
            let startDate;
            let endDate;
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
                if (isNaN(startDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Invalid startDate format',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
                if (isNaN(endDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Invalid endDate format',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
            }
            const query = {
                page,
                limit,
                feedback,
                category,
                sessionId,
                startDate,
                endDate,
            };
            const result = await interactions_service_1.interactionsService.getInteractions(query);
            res.status(200).json({
                success: true,
                data: {
                    interactions: result.interactions.map((interaction) => ({
                        id: interaction.id,
                        question: interaction.question,
                        answer: interaction.answer,
                        feedback: interaction.feedback,
                        comment: interaction.comment,
                        timestamp: interaction.timestamp,
                        sessionId: interaction.sessionId,
                        category: interaction.category,
                        createdAt: interaction.createdAt,
                        updatedAt: interaction.updatedAt,
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
            logger_1.logger.error('List interactions error:', error);
            next(error);
        }
    }
    /**
     * Get metrics and statistics
     * GET /api/chatbot/interactions/metrics
     * Admin only endpoint
     */
    async getMetrics(req, res, next) {
        try {
            // Parse optional date filters
            let startDate;
            let endDate;
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
                if (isNaN(startDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Invalid startDate format',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
                if (isNaN(endDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Invalid endDate format',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
            }
            const metrics = await interactions_service_1.interactionsService.getMetrics(startDate, endDate);
            res.status(200).json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get metrics error:', error);
            next(error);
        }
    }
}
exports.interactionsController = new InteractionsController();
//# sourceMappingURL=interactions.controller.js.map