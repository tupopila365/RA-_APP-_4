"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementOpeningRegisterService = void 0;
const db_1 = require("../../config/db");
const procurement_opening_register_entity_1 = require("./procurement-opening-register.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
function parseId(id) {
    const num = parseInt(id, 10);
    if (isNaN(num)) {
        throw {
            statusCode: 404,
            code: errors_1.ERROR_CODES.NOT_FOUND,
            message: 'Procurement opening register item not found',
        };
    }
    return num;
}
class ProcurementOpeningRegisterService {
    async createItem(dto, createdBy) {
        try {
            logger_1.logger.info('Creating procurement opening register item:', {
                reference: dto.reference,
                type: dto.type,
            });
            const repo = db_1.AppDataSource.getRepository(procurement_opening_register_entity_1.ProcurementOpeningRegister);
            const item = repo.create({
                type: dto.type,
                reference: dto.reference,
                description: dto.description,
                bidOpeningDate: dto.bidOpeningDate,
                status: dto.status,
                noticeUrl: dto.noticeUrl,
                noticeFileName: dto.noticeFileName,
                category: dto.category,
                published: dto.published || false,
                createdBy: createdBy ?? null,
            });
            const saved = await repo.save(item);
            logger_1.logger.info(`Procurement opening register item created with ID: ${saved.id}`);
            return saved;
        }
        catch (error) {
            logger_1.logger.error('Create procurement opening register error:', error);
            if (error.number === 2627 || error.code === 'EREQUEST') {
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
    async listItems(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(procurement_opening_register_entity_1.ProcurementOpeningRegister);
            const qb = repo.createQueryBuilder('p');
            if (query.type)
                qb.andWhere('p.type = :type', { type: query.type });
            if (query.status)
                qb.andWhere('p.status = :status', { status: query.status });
            if (query.category)
                qb.andWhere('p.category = :category', { category: query.category });
            if (query.published !== undefined)
                qb.andWhere('p.published = :published', { published: query.published });
            if (query.search) {
                qb.andWhere('(p.reference LIKE :search OR p.description LIKE :search)', { search: `%${query.search}%` });
            }
            const [items, total] = await qb
                .orderBy('p.bidOpeningDate', 'DESC')
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
            logger_1.logger.error('List procurement opening register error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement opening register items',
                details: error.message,
            };
        }
    }
    async getItemById(id) {
        try {
            const numId = parseId(id);
            const item = await db_1.AppDataSource.getRepository(procurement_opening_register_entity_1.ProcurementOpeningRegister).findOne({
                where: { id: numId },
            });
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
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve procurement opening register item',
                details: error.message,
            };
        }
    }
    async updateItem(id, dto) {
        try {
            logger_1.logger.info(`Updating procurement opening register item: ${id}`);
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_opening_register_entity_1.ProcurementOpeningRegister);
            const existing = await repo.findOne({ where: { id: numId } });
            if (!existing) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement opening register item not found',
                };
            }
            if (dto.type !== undefined)
                existing.type = dto.type;
            if (dto.reference !== undefined)
                existing.reference = dto.reference;
            if (dto.description !== undefined)
                existing.description = dto.description;
            if (dto.bidOpeningDate !== undefined)
                existing.bidOpeningDate = dto.bidOpeningDate;
            if (dto.status !== undefined)
                existing.status = dto.status;
            if (dto.noticeUrl !== undefined)
                existing.noticeUrl = dto.noticeUrl;
            if (dto.noticeFileName !== undefined)
                existing.noticeFileName = dto.noticeFileName;
            if (dto.category !== undefined)
                existing.category = dto.category;
            if (dto.published === true && !existing.published && !existing.publishedAt) {
                existing.publishedAt = new Date();
            }
            if (dto.published !== undefined)
                existing.published = dto.published;
            const item = await repo.save(existing);
            logger_1.logger.info(`Procurement opening register item ${id} updated successfully`);
            return item;
        }
        catch (error) {
            logger_1.logger.error('Update procurement opening register error:', error);
            if (error.statusCode)
                throw error;
            if (error.number === 2627) {
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
            const numId = parseId(id);
            const repo = db_1.AppDataSource.getRepository(procurement_opening_register_entity_1.ProcurementOpeningRegister);
            const item = await repo.findOne({ where: { id: numId } });
            if (!item) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Procurement opening register item not found',
                };
            }
            await repo.remove(item);
            logger_1.logger.info(`Procurement opening register item ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete procurement opening register error:', { id, error: error.message });
            if (error.statusCode)
                throw error;
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