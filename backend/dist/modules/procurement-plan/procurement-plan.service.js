"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementPlanService = void 0;
const procurement_plan_model_1 = require("./procurement-plan.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementPlanService {
    /**
     * Create a new procurement plan
     */
    async createPlan(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement plan:', { fiscalYear: dto.fiscalYear });
            const plan = await procurement_plan_model_1.ProcurementPlanModel.create({
                fiscalYear: dto.fiscalYear,
                documentUrl: dto.documentUrl,
                documentFileName: dto.documentFileName,
                published: dto.published || false,
                createdBy,
            });
            logger_1.logger.info(`Procurement plan created with ID: ${plan._id}`);
            return plan;
        }
        catch (error) {
            logger_1.logger.error('Create procurement plan error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create procurement plan',
                details: error.message,
            };
        }
    }
    /**
     * List procurement plans with pagination, filtering, and search
     */
    async listPlans(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.fiscalYear) {
                filter.fiscalYear = query.fiscalYear;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [items, total] = await Promise.all([
                procurement_plan_model_1.ProcurementPlanModel.find(filter)
                    .sort({ publishedAt: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                procurement_plan_model_1.ProcurementPlanModel.countDocuments(filter),
            ]);
            return {
                items: items,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List procurement plans error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement plans',
                details: error.message,
            };
        }
    }
    /**
     * Get a single procurement plan by ID
     */
    async getPlanById(id) {
        try {
            const plan = await procurement_plan_model_1.ProcurementPlanModel.findById(id).lean();
            if (!plan) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement plan not found',
                };
            }
            return plan;
        }
        catch (error) {
            logger_1.logger.error('Get procurement plan error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement plan',
                details: error.message,
            };
        }
    }
    /**
     * Update procurement plan
     */
    async updatePlan(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement plan: ${id}`);
            const updateData = { ...dto };
            // If publishing for the first time, set publishedAt
            if (dto.published === true) {
                const existing = await procurement_plan_model_1.ProcurementPlanModel.findById(id);
                if (existing && !existing.published && !existing.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            const plan = await procurement_plan_model_1.ProcurementPlanModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            }).lean();
            if (!plan) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement plan not found',
                };
            }
            logger_1.logger.info(`Procurement plan ${id} updated successfully`);
            return plan;
        }
        catch (error) {
            logger_1.logger.error('Update procurement plan error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement plan',
                details: error.message,
            };
        }
    }
    /**
     * Delete procurement plan
     */
    async deletePlan(id) {
        try {
            if (!id || id === 'undefined' || id === 'null') {
                logger_1.logger.error('Delete called with invalid ID:', id);
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Procurement plan ID is required',
                };
            }
            logger_1.logger.info(`Deleting procurement plan: ${id}`);
            const plan = await procurement_plan_model_1.ProcurementPlanModel.findByIdAndDelete(id);
            if (!plan) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement plan not found',
                };
            }
            logger_1.logger.info(`Procurement plan ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement plan error:', { id, error: error.message });
            if (error.statusCode) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid procurement plan ID format',
                    details: error.message,
                };
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete procurement plan',
                details: error.message,
            };
        }
    }
}
exports.procurementPlanService = new ProcurementPlanService();
//# sourceMappingURL=procurement-plan.service.js.map