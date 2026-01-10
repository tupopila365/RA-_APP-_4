"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementAwardService = void 0;
const procurement_awards_model_1 = require("./procurement-awards.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementAwardService {
    /**
     * Create a new procurement award
     */
    async createAward(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement award:', {
                procurementReference: dto.procurementReference,
                type: dto.type,
            });
            const award = await procurement_awards_model_1.ProcurementAwardModel.create({
                type: dto.type,
                procurementReference: dto.procurementReference,
                description: dto.description,
                executiveSummary: dto.executiveSummary,
                successfulBidder: dto.successfulBidder,
                dateAwarded: dto.dateAwarded,
                published: dto.published || false,
                createdBy,
            });
            logger_1.logger.info(`Procurement award created with ID: ${award._id}`);
            return award;
        }
        catch (error) {
            logger_1.logger.error('Create procurement award error:', error);
            if (error.code === 11000) {
                // Duplicate key error
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement reference already exists',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create procurement award',
                details: error.message,
            };
        }
    }
    /**
     * List procurement awards with pagination, filtering, and search
     */
    async listAwards(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.type) {
                filter.type = query.type;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [items, total] = await Promise.all([
                procurement_awards_model_1.ProcurementAwardModel.find(filter)
                    .sort({ dateAwarded: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                procurement_awards_model_1.ProcurementAwardModel.countDocuments(filter),
            ]);
            return {
                items: items,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List procurement awards error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement awards',
                details: error.message,
            };
        }
    }
    /**
     * Get a single procurement award by ID
     */
    async getAwardById(id) {
        try {
            const award = await procurement_awards_model_1.ProcurementAwardModel.findById(id).lean();
            if (!award) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement award not found',
                };
            }
            return award;
        }
        catch (error) {
            logger_1.logger.error('Get procurement award error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement award',
                details: error.message,
            };
        }
    }
    /**
     * Update procurement award
     */
    async updateAward(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement award: ${id}`);
            const updateData = { ...dto };
            // If publishing for the first time, set publishedAt
            if (dto.published === true) {
                const existing = await procurement_awards_model_1.ProcurementAwardModel.findById(id);
                if (existing && !existing.published && !existing.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            const award = await procurement_awards_model_1.ProcurementAwardModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }).lean();
            if (!award) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement award not found',
                };
            }
            logger_1.logger.info(`Procurement award ${id} updated successfully`);
            return award;
        }
        catch (error) {
            logger_1.logger.error('Update procurement award error:', error);
            if (error.statusCode) {
                throw error;
            }
            if (error.code === 11000) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement reference already exists',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement award',
                details: error.message,
            };
        }
    }
    /**
     * Delete procurement award
     */
    async deleteAward(id) {
        try {
            if (!id || id === 'undefined' || id === 'null') {
                logger_1.logger.error('Delete called with invalid ID:', id);
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement award ID is required',
                };
            }
            logger_1.logger.info(`Deleting procurement award: ${id}`);
            const award = await procurement_awards_model_1.ProcurementAwardModel.findByIdAndDelete(id);
            if (!award) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement award not found',
                };
            }
            logger_1.logger.info(`Procurement award ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement award error:', { id, error: error.message });
            if (error.statusCode) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid procurement award ID format',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete procurement award',
                details: error.message,
            };
        }
    }
}
exports.procurementAwardService = new ProcurementAwardService();
//# sourceMappingURL=procurement-awards.service.js.map