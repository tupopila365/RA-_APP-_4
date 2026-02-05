"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementLegislationService = void 0;
const db_1 = require("../../config/db");
const procurement_legislation_entity_1 = require("./procurement-legislation.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
function parseId(id) {
    const num = parseInt(id, 10);
    if (isNaN(num)) {
        throw {
            statusCode: 404,
            code: errors_1.ERROR_CODES.NOT_FOUND,
            message: 'Procurement legislation not found',
        };
    }
    return num;
}
class ProcurementLegislationService {
    async createLegislation(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement legislation:', { title: dto.title, section: dto.section });
            const repo = db_1.AppDataSource.getRepository(procurement_legislation_entity_1.ProcurementLegislation);
            const legislation = repo.create({
                section: dto.section,
                title: dto.title,
                documentUrl: dto.documentUrl,
                documentFileName: dto.documentFileName,
                published: dto.published || false,
                createdBy: createdBy ?? null,
            });
            const saved = await repo.save(legislation);
            logger_1.logger.info(`Procurement legislation created with ID: ${saved.id}`);
            return saved;
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
    async listLegislation(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(procurement_legislation_entity_1.ProcurementLegislation);
            const qb = repo.createQueryBuilder('p');
            if (query.section)
                qb.andWhere('p.section = :section', { section: query.section });
            if (query.published !== undefined)
                qb.andWhere('p.published = :published', { published: query.published });
            if (query.search) {
                qb.andWhere('(p.title LIKE :search OR p.section LIKE :search)', { search: `%${query.search}%` });
            }
            const [items, total] = await qb
                .orderBy('p.publishedAt', 'DESC')
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
            logger_1.logger.error('List procurement legislation error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement legislation',
                details: error.message,
            };
        }
    }
    async getLegislationById(id) {
        try {
            const numId = parseId(id);
            const legislation = await db_1.AppDataSource.getRepository(procurement_legislation_entity_1.ProcurementLegislation).findOne({
                where: { id: numId },
            });
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
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement legislation',
                details: error.message,
            };
        }
    }
    async updateLegislation(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement legislation: ${id}`);
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_legislation_entity_1.ProcurementLegislation);
            const existing = await repo.findOne({ where: { id: numId } });
            if (!existing) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement legislation not found',
                };
            }
            if (dto.section !== undefined)
                existing.section = dto.section;
            if (dto.title !== undefined)
                existing.title = dto.title;
            if (dto.documentUrl !== undefined)
                existing.documentUrl = dto.documentUrl;
            if (dto.documentFileName !== undefined)
                existing.documentFileName = dto.documentFileName;
            if (dto.published === true && !existing.published && !existing.publishedAt) {
                existing.publishedAt = new Date();
            }
            if (dto.published !== undefined)
                existing.published = dto.published;
            const legislation = await repo.save(existing);
            logger_1.logger.info(`Procurement legislation ${id} updated successfully`);
            return legislation;
        }
        catch (error) {
            logger_1.logger.error('Update procurement legislation error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update procurement legislation',
                details: error.message,
            };
        }
    }
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
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_legislation_entity_1.ProcurementLegislation);
            const legislation = await repo.findOne({ where: { id: numId } });
            if (!legislation) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement legislation not found',
                };
            }
            await repo.remove(legislation);
            logger_1.logger.info(`Procurement legislation ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement legislation error:', { id, error: error.message });
            if (error.statusCode)
                throw error;
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