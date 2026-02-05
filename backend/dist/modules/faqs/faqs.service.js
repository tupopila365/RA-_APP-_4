"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsService = void 0;
const db_1 = require("../../config/db");
const faqs_entity_1 = require("./faqs.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class FAQService {
    async createFAQ(dto) {
        try {
            logger_1.logger.info('Creating FAQ:', { question: dto.question });
            const repo = db_1.AppDataSource.getRepository(faqs_entity_1.FAQ);
            const faq = repo.create({
                question: dto.question,
                answer: dto.answer,
                category: dto.category,
                order: dto.order || 0,
            });
            await repo.save(faq);
            logger_1.logger.info(`FAQ created with ID: ${faq.id}`);
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Create FAQ error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create FAQ',
                details: error.message,
            };
        }
    }
    async listFAQs(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(faqs_entity_1.FAQ);
            const buildQb = () => {
                const qb = repo.createQueryBuilder('f');
                if (query.category)
                    qb.andWhere('f.category = :category', { category: query.category });
                if (query.search) {
                    qb.andWhere('(f.question LIKE :search OR f.answer LIKE :search)', { search: `%${query.search}%` });
                }
                return qb;
            };
            const [faqs, total] = await Promise.all([
                buildQb().orderBy('f.order', 'ASC').addOrderBy('f.createdAt', 'DESC').skip(skip).take(limit).getMany(),
                buildQb().getCount(),
            ]);
            return { faqs, total, page, totalPages: Math.ceil(total / limit) };
        }
        catch (error) {
            logger_1.logger.error('List FAQs error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve FAQs',
                details: error.message,
            };
        }
    }
    async getFAQById(faqId) {
        try {
            const id = parseInt(faqId, 10);
            const repo = db_1.AppDataSource.getRepository(faqs_entity_1.FAQ);
            const faq = await repo.findOne({ where: { id } });
            if (!faq) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
            }
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Get FAQ error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve FAQ',
                details: error.message,
            };
        }
    }
    async updateFAQ(faqId, dto) {
        try {
            logger_1.logger.info(`Updating FAQ: ${faqId}`);
            const id = parseInt(faqId, 10);
            const repo = db_1.AppDataSource.getRepository(faqs_entity_1.FAQ);
            const faq = await repo.findOne({ where: { id } });
            if (!faq) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
            }
            Object.assign(faq, dto);
            await repo.save(faq);
            logger_1.logger.info(`FAQ ${faqId} updated successfully`);
            return faq;
        }
        catch (error) {
            logger_1.logger.error('Update FAQ error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update FAQ',
                details: error.message,
            };
        }
    }
    async deleteFAQ(faqId) {
        try {
            if (!faqId || faqId === 'undefined' || faqId === 'null') {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'FAQ ID is required',
                };
            }
            logger_1.logger.info(`Deleting FAQ: ${faqId}`);
            const id = parseInt(faqId, 10);
            if (isNaN(id)) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid FAQ ID format',
                };
            }
            const repo = db_1.AppDataSource.getRepository(faqs_entity_1.FAQ);
            const faq = await repo.findOne({ where: { id } });
            if (!faq) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
            }
            await repo.remove(faq);
            logger_1.logger.info(`FAQ ${faqId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete FAQ error:', { faqId, error: error.message });
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete FAQ',
                details: error.message,
            };
        }
    }
}
exports.faqsService = new FAQService();
//# sourceMappingURL=faqs.service.js.map