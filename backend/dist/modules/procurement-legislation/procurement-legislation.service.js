"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementLegislationService = void 0;
const procurement_legislation_model_1 = require("./procurement-legislation.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementLegislationService {
    /**
     * Create a new procurement legislation document
     */
    async createLegislation(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement legislation:', { title: dto.title, section: dto.section });
            const legislation = await procurement_legislation_model_1.ProcurementLegislationModel.create({
                section: dto.section,
                title: dto.title,
                documentUrl: dto.documentUrl,
                documentFileName: dto.documentFileName,
                published: dto.published || false,
                createdBy,
            });
            logger_1.logger.info(`Procurement legislation created with ID: ${legislation._id}`);
            return legislation;
        }
        catch (error) {
            logger_1.logger.error('Create procurement legislation error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create procurement legislation',
                details: error.message,
            };
        }
    }
    /**
     * List procurement legislation with pagination, filtering, and search
     */
    async listLegislation(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.section) {
                filter.section = query.section;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [items, total] = await Promise.all([
                procurement_legislation_model_1.ProcurementLegislationModel.find(filter)
                    .sort({ publishedAt: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                procurement_legislation_model_1.ProcurementLegislationModel.countDocuments(filter),
            ]);
            return {
                items: items,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List procurement legislation error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement legislation',
                details: error.message,
            };
        }
    }
    /**
     * Get a single procurement legislation by ID
     */
    async getLegislationById(id) {
        try {
            const legislation = await procurement_legislation_model_1.ProcurementLegislationModel.findById(id).lean();
            if (!legislation) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement legislation not found',
                };
            }
            return legislation;
        }
        catch (error) {
            logger_1.logger.error('Get procurement legislation error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement legislation',
                details: error.message,
            };
        }
    }
    /**
     * Update procurement legislation
     */
    async updateLegislation(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement legislation: ${id}`);
            const updateData = { ...dto };
            // If publishing for the first time, set publishedAt
            if (dto.published === true) {
                const existing = await procurement_legislation_model_1.ProcurementLegislationModel.findById(id);
                if (existing && !existing.published && !existing.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            const legislation = await procurement_legislation_model_1.ProcurementLegislationModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
            if (!legislation) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement legislation not found',
                };
            }
            logger_1.logger.info(`Procurement legislation ${id} updated successfully`);
            return legislation;
        }
        catch (error) {
            logger_1.logger.error('Update procurement legislation error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement legislation',
                details: error.message,
            };
        }
    }
    /**
     * Delete procurement legislation
     */
    async deleteLegislation(id) {
        try {
            if (!id || id === 'undefined' || id === 'null') {
                logger_1.logger.error('Delete called with invalid ID:', id);
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement legislation ID is required',
                };
            }
            logger_1.logger.info(`Deleting procurement legislation: ${id}`);
            const legislation = await procurement_legislation_model_1.ProcurementLegislationModel.findByIdAndDelete(id);
            if (!legislation) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement legislation not found',
                };
            }
            logger_1.logger.info(`Procurement legislation ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement legislation error:', { id, error: error.message });
            if (error.statusCode) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid procurement legislation ID format',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete procurement legislation',
                details: error.message,
            };
        }
    }
}
exports.procurementLegislationService = new ProcurementLegislationService();
//# sourceMappingURL=procurement-legislation.service.js.map