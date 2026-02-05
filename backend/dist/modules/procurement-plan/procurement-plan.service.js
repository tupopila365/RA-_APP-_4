"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementPlanService = void 0;
const db_1 = require("../../config/db");
const procurement_plan_entity_1 = require("./procurement-plan.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementPlanService {
    async createPlan(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement plan:', { fiscalYear: dto.fiscalYear });
            const repo = db_1.AppDataSource.getRepository(procurement_plan_entity_1.ProcurementPlan);
            const plan = repo.create({
                fiscalYear: dto.fiscalYear,
                documentUrl: dto.documentUrl,
                documentFileName: dto.documentFileName,
                published: dto.published || false,
                createdBy,
            });
            await repo.save(plan);
            logger_1.logger.info(`Procurement plan created with ID: ${plan.id}`);
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
    async listPlans(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(procurement_plan_entity_1.ProcurementPlan);
            const buildQb = () => {
                const qb = repo.createQueryBuilder('p');
                if (query.fiscalYear)
                    qb.andWhere('p.fiscalYear = :fiscalYear', { fiscalYear: query.fiscalYear });
                if (query.published !== undefined)
                    qb.andWhere('p.published = :published', { published: query.published });
                if (query.search)
                    qb.andWhere('p.fiscalYear LIKE :search', { search: `%${query.search}%` });
                return qb;
            };
            const [items, total] = await Promise.all([
                buildQb().orderBy('p.publishedAt', 'DESC').addOrderBy('p.createdAt', 'DESC').skip(skip).take(limit).getMany(),
                buildQb().getCount(),
            ]);
            return { items, total, page, totalPages: Math.ceil(total / limit) };
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
    async getPlanById(id) {
        try {
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(procurement_plan_entity_1.ProcurementPlan);
            const plan = await repo.findOne({ where: { id: idNum } });
            if (!plan) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Procurement plan not found' };
            }
            return plan;
        }
        catch (error) {
            logger_1.logger.error('Get procurement plan error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement plan',
                details: error.message,
            };
        }
    }
    async updatePlan(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement plan: ${id}`);
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(procurement_plan_entity_1.ProcurementPlan);
            const plan = await repo.findOne({ where: { id: idNum } });
            if (!plan) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Procurement plan not found' };
            }
            if (dto.published === true && !plan.publishedAt)
                plan.publishedAt = new Date();
            Object.assign(plan, dto);
            await repo.save(plan);
            logger_1.logger.info(`Procurement plan ${id} updated successfully`);
            return plan;
        }
        catch (error) {
            logger_1.logger.error('Update procurement plan error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement plan',
                details: error.message,
            };
        }
    }
    async deletePlan(id) {
        try {
            if (!id || id === 'undefined' || id === 'null') {
                throw { statusCode: 400, code: errors_1.ERROR_CODES.VALIDATION_ERROR, message: 'Procurement plan ID is required' };
            }
            const idNum = parseInt(id, 10);
            if (isNaN(idNum)) {
                throw { statusCode: 400, code: errors_1.ERROR_CODES.VALIDATION_ERROR, message: 'Invalid procurement plan ID format' };
            }
            logger_1.logger.info(`Deleting procurement plan: ${id}`);
            const repo = db_1.AppDataSource.getRepository(procurement_plan_entity_1.ProcurementPlan);
            const plan = await repo.findOne({ where: { id: idNum } });
            if (!plan) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Procurement plan not found' };
            }
            await repo.remove(plan);
            logger_1.logger.info(`Procurement plan ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement plan error:', { id, error: error.message });
            if (error.statusCode)
                throw error;
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