"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementAwardService = void 0;
const db_1 = require("../../config/db");
const procurement_awards_entity_1 = require("./procurement-awards.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
function parseId(id) {
    const num = parseInt(id, 10);
    if (isNaN(num)) {
        throw {
            statusCode: 404,
            code: errors_1.ERROR_CODES.NOT_FOUND,
            message: 'Procurement award not found',
        };
    }
    return num;
}
class ProcurementAwardService {
    async createAward(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement award:', {
                procurementReference: dto.procurementReference,
                type: dto.type,
            });
            const repo = db_1.AppDataSource.getRepository(procurement_awards_entity_1.ProcurementAward);
            const award = repo.create({
                type: dto.type,
                procurementReference: dto.procurementReference,
                description: dto.description,
                executiveSummary: dto.executiveSummary,
                successfulBidder: dto.successfulBidder,
                dateAwarded: dto.dateAwarded,
                published: dto.published || false,
                createdBy: createdBy ?? null,
            });
            const saved = await repo.save(award);
            logger_1.logger.info(`Procurement award created with ID: ${saved.id}`);
            return saved;
        }
        catch (error) {
            logger_1.logger.error('Create procurement award error:', error);
            if (error.number === 2627) {
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
    async listAwards(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(procurement_awards_entity_1.ProcurementAward);
            const qb = repo.createQueryBuilder('p');
            if (query.type)
                qb.andWhere('p.type = :type', { type: query.type });
            if (query.published !== undefined)
                qb.andWhere('p.published = :published', { published: query.published });
            if (query.search) {
                qb.andWhere('(p.procurementReference LIKE :search OR p.description LIKE :search OR p.successfulBidder LIKE :search)', { search: `%${query.search}%` });
            }
            const [items, total] = await qb
                .orderBy('p.dateAwarded', 'DESC')
                .addOrderBy('p.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            return {
                items,
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
    async getAwardById(id) {
        try {
            const numId = parseId(id);
            const award = await db_1.AppDataSource.getRepository(procurement_awards_entity_1.ProcurementAward).findOne({
                where: { id: numId },
            });
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
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement award',
                details: error.message,
            };
        }
    }
    async updateAward(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement award: ${id}`);
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_awards_entity_1.ProcurementAward);
            const existing = await repo.findOne({ where: { id: numId } });
            if (!existing) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement award not found',
                };
            }
            if (dto.type !== undefined)
                existing.type = dto.type;
            if (dto.procurementReference !== undefined)
                existing.procurementReference = dto.procurementReference;
            if (dto.description !== undefined)
                existing.description = dto.description;
            if (dto.executiveSummary !== undefined)
                existing.executiveSummary = dto.executiveSummary;
            if (dto.successfulBidder !== undefined)
                existing.successfulBidder = dto.successfulBidder;
            if (dto.dateAwarded !== undefined)
                existing.dateAwarded = dto.dateAwarded;
            if (dto.published === true && !existing.published && !existing.publishedAt) {
                existing.publishedAt = new Date();
            }
            if (dto.published !== undefined)
                existing.published = dto.published;
            const award = await repo.save(existing);
            logger_1.logger.info(`Procurement award ${id} updated successfully`);
            return award;
        }
        catch (error) {
            logger_1.logger.error('Update procurement award error:', error);
            if (error.statusCode)
                throw error;
            if (error.number === 2627) {
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
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_awards_entity_1.ProcurementAward);
            const award = await repo.findOne({ where: { id: numId } });
            if (!award) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement award not found',
                };
            }
            await repo.remove(award);
            logger_1.logger.info(`Procurement award ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement award error:', { id, error: error.message });
            if (error.statusCode)
                throw error;
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