"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionsService = void 0;
const interactions_model_1 = require("./interactions.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class InteractionsService {
    /**
     * Auto-detect category from question text using keyword matching
     */
    detectCategory(question) {
        const lowerQuestion = question.toLowerCase();
        // Category keywords mapping
        const categoryKeywords = {
            policy: ['policy', 'policies', 'rule', 'rules', 'regulation', 'regulations', 'guideline', 'guidelines'],
            tender: ['tender', 'tenders', 'bidding', 'bid', 'procurement', 'contract', 'contracts'],
            report: ['report', 'reports', 'annual', 'quarterly', 'statistics', 'data'],
            location: ['location', 'locations', 'office', 'offices', 'address', 'where', 'find', 'near'],
            contact: ['contact', 'phone', 'email', 'call', 'reach', 'how to contact', 'telephone'],
            procedure: ['procedure', 'process', 'how to', 'step', 'steps', 'application', 'apply', 'form'],
        };
        // Check each category for keyword matches
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some((keyword) => lowerQuestion.includes(keyword))) {
                return category;
            }
        }
        // Default to general if no match
        return 'general';
    }
    /**
     * Log a new interaction after chatbot query
     */
    async logInteraction(dto) {
        try {
            const category = dto.category || this.detectCategory(dto.question);
            const interaction = await interactions_model_1.ChatbotInteractionModel.create({
                question: dto.question,
                answer: dto.answer,
                sessionId: dto.sessionId,
                category,
                timestamp: new Date(),
            });
            logger_1.logger.info(`Interaction logged with ID: ${interaction._id}`, {
                sessionId: dto.sessionId,
                category,
            });
            return interaction;
        }
        catch (error) {
            logger_1.logger.error('Log interaction error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to log interaction',
                details: error.message,
            };
        }
    }
    /**
     * Update feedback for an existing interaction
     */
    async updateFeedback(interactionId, dto) {
        try {
            const updateData = {
                feedback: dto.feedback,
            };
            if (dto.comment !== undefined) {
                updateData.comment = dto.comment || undefined; // Convert empty string to undefined
            }
            const interaction = await interactions_model_1.ChatbotInteractionModel.findByIdAndUpdate(interactionId, updateData, { new: true, runValidators: true }).lean();
            if (!interaction) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Interaction not found',
                };
            }
            logger_1.logger.info(`Feedback updated for interaction ${interactionId}`, {
                feedback: dto.feedback,
            });
            return interaction;
        }
        catch (error) {
            logger_1.logger.error('Update feedback error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update feedback',
                details: error.message,
            };
        }
    }
    /**
     * Get interactions with pagination and filtering
     */
    async getInteractions(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 20));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.feedback !== undefined) {
                filter.feedback = query.feedback;
            }
            if (query.category) {
                filter.category = query.category;
            }
            if (query.sessionId) {
                filter.sessionId = query.sessionId;
            }
            if (query.startDate || query.endDate) {
                filter.timestamp = {};
                if (query.startDate) {
                    filter.timestamp.$gte = query.startDate;
                }
                if (query.endDate) {
                    // Include the entire end date
                    const endDate = new Date(query.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    filter.timestamp.$lte = endDate;
                }
            }
            // Execute query with pagination
            const [interactions, total] = await Promise.all([
                interactions_model_1.ChatbotInteractionModel.find(filter)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                interactions_model_1.ChatbotInteractionModel.countDocuments(filter),
            ]);
            return {
                interactions: interactions,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('Get interactions error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve interactions',
                details: error.message,
            };
        }
    }
    /**
     * Get metrics and statistics
     */
    async getMetrics(startDate, endDate) {
        try {
            // Build date filter
            const dateFilter = {};
            if (startDate) {
                dateFilter.$gte = startDate;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            const filter = Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {};
            // Get total counts
            const [totalQuestions, totalLikes, totalDislikes] = await Promise.all([
                interactions_model_1.ChatbotInteractionModel.countDocuments(filter),
                interactions_model_1.ChatbotInteractionModel.countDocuments({ ...filter, feedback: 'like' }),
                interactions_model_1.ChatbotInteractionModel.countDocuments({ ...filter, feedback: 'dislike' }),
            ]);
            // Calculate like/dislike ratio
            const likeDislikeRatio = totalDislikes > 0 ? Number((totalLikes / totalDislikes).toFixed(2)) : totalLikes > 0 ? totalLikes : 0;
            // Get most disliked questions
            const mostDislikedAggregation = await interactions_model_1.ChatbotInteractionModel.aggregate([
                { $match: { ...filter, feedback: 'dislike' } },
                {
                    $group: {
                        _id: { question: '$question', answer: '$answer' },
                        dislikeCount: { $sum: 1 },
                        interactionId: { $first: '$_id' },
                    },
                },
                { $sort: { dislikeCount: -1 } },
                { $limit: 10 },
            ]);
            const mostDislikedQuestions = mostDislikedAggregation.map((item) => ({
                question: item._id.question,
                answer: item._id.answer,
                dislikeCount: item.dislikeCount,
                interactionId: item.interactionId.toString(),
            }));
            // Get questions by category
            const categoryAggregation = await interactions_model_1.ChatbotInteractionModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                    },
                },
            ]);
            const questionsByCategory = {};
            categoryAggregation.forEach((item) => {
                questionsByCategory[item._id || 'general'] = item.count;
            });
            // Get questions over time (last 30 days, grouped by day)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const timeFilter = { ...filter, timestamp: { ...dateFilter, $gte: thirtyDaysAgo } };
            const timeAggregation = await interactions_model_1.ChatbotInteractionModel.aggregate([
                { $match: timeFilter },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$timestamp',
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            const questionsOverTime = timeAggregation.map((item) => ({
                date: item._id,
                count: item.count,
            }));
            return {
                totalQuestions,
                totalLikes,
                totalDislikes,
                likeDislikeRatio,
                mostDislikedQuestions,
                questionsByCategory,
                questionsOverTime,
            };
        }
        catch (error) {
            logger_1.logger.error('Get metrics error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve metrics',
                details: error.message,
            };
        }
    }
}
exports.interactionsService = new InteractionsService();
//# sourceMappingURL=interactions.service.js.map