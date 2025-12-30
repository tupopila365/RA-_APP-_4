"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsService = void 0;
const faqs_model_1 = require("./faqs.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class FAQService {
    /**
     * Create a new FAQ
     */
    async createFAQ(dto) {
        try {
            logger_1.logger.info('Creating FAQ:', { question: dto.question });
            const faq = await faqs_model_1.FAQModel.create({
                question: dto.question,
                answer: dto.answer,
                category: dto.category,
                order: dto.order || 0,
            });
            logger_1.logger.info(`FAQ created with ID: ${faq._id}`);
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Create FAQ error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create FAQ',
                details: error.message,
            };
        }
    }
    /**
     * List FAQs with pagination, filtering, and search
     */
    async listFAQs(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.category) {
                filter.category = query.category;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [faqs, total] = await Promise.all([
                faqs_model_1.FAQModel.find(filter)
                    .sort({ order: 1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                faqs_model_1.FAQModel.countDocuments(filter),
            ]);
            return {
                faqs: faqs,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List FAQs error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve FAQs',
                details: error.message,
            };
        }
    }
    /**
     * Get a single FAQ by ID
     */
    async getFAQById(faqId) {
        try {
            const faq = await faqs_model_1.FAQModel.findById(faqId).lean();
            if (!faq) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'FAQ not found',
                };
            }
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Get FAQ error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve FAQ',
                details: error.message,
            };
        }
    }
    /**
     * Update a FAQ
     */
    async updateFAQ(faqId, dto) {
        try {
            logger_1.logger.info(`Updating FAQ: ${faqId}`);
            const faq = await faqs_model_1.FAQModel.findByIdAndUpdate(faqId, dto, { new: true, runValidators: true }).lean();
            if (!faq) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'FAQ not found',
                };
            }
            logger_1.logger.info(`FAQ ${faqId} updated successfully`);
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Update FAQ error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update FAQ',
                details: error.message,
            };
        }
    }
    /**
     * Delete a FAQ
     */
    async deleteFAQ(faqId) {
        try {
            // Validate ID is provided
            if (!faqId || faqId === 'undefined' || faqId === 'null') {
                logger_1.logger.error('Delete called with invalid ID:', faqId);
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'FAQ ID is required',
                };
            }
            logger_1.logger.info(`Deleting FAQ: ${faqId}`);
            const faq = await faqs_model_1.FAQModel.findByIdAndDelete(faqId);
            if (!faq) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'FAQ not found',
                };
            }
            logger_1.logger.info(`FAQ ${faqId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete FAQ error:', { faqId, error: error.message });
            if (error.statusCode) {
                throw error;
            }
            // Handle Mongoose CastError (invalid ObjectId format)
            if (error.name === 'CastError') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid FAQ ID format',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete FAQ',
                details: error.message,
            };
        }
    }
}
exports.faqsService = new FAQService();
//# sourceMappingURL=faqs.service.js.map