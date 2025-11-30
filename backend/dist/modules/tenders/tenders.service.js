"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tendersService = void 0;
const tenders_model_1 = require("./tenders.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class TendersService {
    /**
     * Create a new tender
     */
    async createTender(dto) {
        try {
            logger_1.logger.info('Creating tender:', { referenceNumber: dto.referenceNumber, title: dto.title });
            const tender = await tenders_model_1.TenderModel.create({
                referenceNumber: dto.referenceNumber,
                title: dto.title,
                description: dto.description,
                category: dto.category,
                value: dto.value,
                status: dto.status,
                openingDate: dto.openingDate,
                closingDate: dto.closingDate,
                pdfUrl: dto.pdfUrl,
                published: dto.published || false,
            });
            logger_1.logger.info(`Tender created with ID: ${tender._id}`);
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Create tender error:', error);
            // Handle duplicate reference number
            if (error.code === 11000) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'A tender with this reference number already exists',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create tender',
                details: error.message,
            };
        }
    }
    /**
     * List tenders with pagination, filtering, and search
     */
    async listTenders(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.status) {
                filter.status = query.status;
            }
            if (query.category) {
                filter.category = query.category;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [tenders, total] = await Promise.all([
                tenders_model_1.TenderModel.find(filter)
                    .sort({ closingDate: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                tenders_model_1.TenderModel.countDocuments(filter),
            ]);
            return {
                tenders: tenders,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List tenders error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve tenders',
                details: error.message,
            };
        }
    }
    /**
     * Get a single tender by ID
     */
    async getTenderById(tenderId) {
        try {
            const tender = await tenders_model_1.TenderModel.findById(tenderId).lean();
            if (!tender) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Tender not found',
                };
            }
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Get tender error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve tender',
                details: error.message,
            };
        }
    }
    /**
     * Update a tender
     */
    async updateTender(tenderId, dto) {
        try {
            logger_1.logger.info(`Updating tender: ${tenderId}`);
            const tender = await tenders_model_1.TenderModel.findByIdAndUpdate(tenderId, dto, { new: true, runValidators: true }).lean();
            if (!tender) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Tender not found',
                };
            }
            logger_1.logger.info(`Tender ${tenderId} updated successfully`);
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Update tender error:', error);
            // Handle duplicate reference number
            if (error.code === 11000) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'A tender with this reference number already exists',
                    details: error.message,
                };
            }
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update tender',
                details: error.message,
            };
        }
    }
    /**
     * Delete a tender
     */
    async deleteTender(tenderId) {
        try {
            logger_1.logger.info(`Deleting tender: ${tenderId}`);
            const tender = await tenders_model_1.TenderModel.findByIdAndDelete(tenderId);
            if (!tender) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Tender not found',
                };
            }
            logger_1.logger.info(`Tender ${tenderId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete tender error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete tender',
                details: error.message,
            };
        }
    }
}
exports.tendersService = new TendersService();
//# sourceMappingURL=tenders.service.js.map