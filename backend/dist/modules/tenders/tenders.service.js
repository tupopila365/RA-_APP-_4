"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tendersService = void 0;
const db_1 = require("../../config/db");
const tenders_entity_1 = require("./tenders.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class TendersService {
    async createTender(dto) {
        try {
            logger_1.logger.info('Creating tender:', { referenceNumber: dto.referenceNumber, title: dto.title });
            const repo = db_1.AppDataSource.getRepository(tenders_entity_1.Tender);
            const existing = await repo.findOne({ where: { referenceNumber: dto.referenceNumber } });
            if (existing) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'A tender with this reference number already exists',
                };
            }
            const tender = repo.create({
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
            await repo.save(tender);
            logger_1.logger.info(`Tender created with ID: ${tender.id}`);
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Create tender error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create tender',
                details: error.message,
            };
        }
    }
    async listTenders(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(tenders_entity_1.Tender);
            const buildQb = () => {
                const qb = repo.createQueryBuilder('t');
                if (query.status)
                    qb.andWhere('t.status = :status', { status: query.status });
                if (query.category)
                    qb.andWhere('t.category = :category', { category: query.category });
                if (query.published !== undefined)
                    qb.andWhere('t.published = :published', { published: query.published });
                if (query.search) {
                    qb.andWhere('(t.title LIKE :search OR t.description LIKE :search)', { search: `%${query.search}%` });
                }
                return qb;
            };
            const [tenders, total] = await Promise.all([
                buildQb().orderBy('t.closingDate', 'DESC').addOrderBy('t.createdAt', 'DESC').skip(skip).take(limit).getMany(),
                buildQb().getCount(),
            ]);
            return { tenders, total, page, totalPages: Math.ceil(total / limit) };
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
    async getTenderById(tenderId) {
        try {
            const id = parseInt(tenderId, 10);
            const repo = db_1.AppDataSource.getRepository(tenders_entity_1.Tender);
            const tender = await repo.findOne({ where: { id } });
            if (!tender) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Tender not found' };
            }
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Get tender error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve tender',
                details: error.message,
            };
        }
    }
    async updateTender(tenderId, dto) {
        try {
            logger_1.logger.info(`Updating tender: ${tenderId}`);
            const id = parseInt(tenderId, 10);
            const repo = db_1.AppDataSource.getRepository(tenders_entity_1.Tender);
            const tender = await repo.findOne({ where: { id } });
            if (!tender) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Tender not found' };
            }
            if (dto.referenceNumber && dto.referenceNumber !== tender.referenceNumber) {
                const existing = await repo.findOne({ where: { referenceNumber: dto.referenceNumber } });
                if (existing) {
                    throw {
                        statusCode: 400,
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'A tender with this reference number already exists',
                    };
                }
            }
            Object.assign(tender, dto);
            await repo.save(tender);
            logger_1.logger.info(`Tender ${tenderId} updated successfully`);
            return tender;
        }
        catch (error) {
            logger_1.logger.error('Update tender error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update tender',
                details: error.message,
            };
        }
    }
    async deleteTender(tenderId) {
        try {
            logger_1.logger.info(`Deleting tender: ${tenderId}`);
            const id = parseInt(tenderId, 10);
            const repo = db_1.AppDataSource.getRepository(tenders_entity_1.Tender);
            const tender = await repo.findOne({ where: { id } });
            if (!tender) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Tender not found' };
            }
            await repo.remove(tender);
            logger_1.logger.info(`Tender ${tenderId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete tender error:', error);
            if (error.statusCode)
                throw error;
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