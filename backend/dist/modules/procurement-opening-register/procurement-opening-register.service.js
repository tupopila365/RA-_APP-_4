"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementOpeningRegisterService = void 0;
const procurement_opening_register_model_1 = require("./procurement-opening-register.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementOpeningRegisterService {
    /**
     * Create a new procurement opening register item
     */
    async createItem(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement opening register item:', {
                reference: dto.reference,
                type: dto.type,
            });
            const item = await procurement_opening_register_model_1.ProcurementOpeningRegisterModel.create({
                type: dto.type,
                reference: dto.reference,
                description: dto.description,
                bidOpeningDate: dto.bidOpeningDate,
                status: dto.status,
                noticeUrl: dto.noticeUrl,
                noticeFileName: dto.noticeFileName,
                category: dto.category,
                published: dto.published || false,
                createdBy,
            });
            logger_1.logger.info(`Procurement opening register item created with ID: ${item._id}`);
            return item;
        }
        catch (error) {
            logger_1.logger.error('Create procurement opening register error:', error);
            if (error.code === 11000) {
                // Duplicate key error
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Reference already exists',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create procurement opening register item',
                details: error.message,
            };
        }
    }
    /**
     * List procurement opening register items with pagination, filtering, and search
     */
    async listItems(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.type) {
                filter.type = query.type;
            }
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
            const [items, total] = await Promise.all([
                procurement_opening_register_model_1.ProcurementOpeningRegisterModel.find(filter)
                    .sort({ bidOpeningDate: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                procurement_opening_register_model_1.ProcurementOpeningRegisterModel.countDocuments(filter),
            ]);
            return {
                items: items,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List procurement opening register error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement opening register items',
                details: error.message,
            };
        }
    }
    /**
     * Get a single procurement opening register item by ID
     */
    async getItemById(id) {
        try {
            const item = await procurement_opening_register_model_1.ProcurementOpeningRegisterModel.findById(id).lean();
            if (!item) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement opening register item not found',
                };
            }
            return item;
        }
        catch (error) {
            logger_1.logger.error('Get procurement opening register error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement opening register item',
                details: error.message,
            };
        }
    }
    /**
     * Update procurement opening register item
     */
    async updateItem(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement opening register item: ${id}`);
            const updateData = { ...dto };
            // If publishing for the first time, set publishedAt
            if (dto.published === true) {
                const existing = await procurement_opening_register_model_1.ProcurementOpeningRegisterModel.findById(id);
                if (existing && !existing.published && !existing.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            const item = await procurement_opening_register_model_1.ProcurementOpeningRegisterModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }).lean();
            if (!item) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement opening register item not found',
                };
            }
            logger_1.logger.info(`Procurement opening register item ${id} updated successfully`);
            return item;
        }
        catch (error) {
            logger_1.logger.error('Update procurement opening register error:', error);
            if (error.statusCode) {
                throw error;
            }
            if (error.code === 11000) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Reference already exists',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement opening register item',
                details: error.message,
            };
        }
    }
    /**
     * Delete procurement opening register item
     */
    async deleteItem(id) {
        try {
            if (!id || id === 'undefined' || id === 'null') {
                logger_1.logger.error('Delete called with invalid ID:', id);
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement opening register item ID is required',
                };
            }
            logger_1.logger.info(`Deleting procurement opening register item: ${id}`);
            const item = await procurement_opening_register_model_1.ProcurementOpeningRegisterModel.findByIdAndDelete(id);
            if (!item) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement opening register item not found',
                };
            }
            logger_1.logger.info(`Procurement opening register item ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement opening register error:', { id, error: error.message });
            if (error.statusCode) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid procurement opening register item ID format',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete procurement opening register item',
                details: error.message,
            };
        }
    }
}
exports.procurementOpeningRegisterService = new ProcurementOpeningRegisterService();
//# sourceMappingURL=procurement-opening-register.service.js.map