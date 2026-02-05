"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formService = exports.FormService = void 0;
const db_1 = require("../../config/db");
const forms_entity_1 = require("./forms.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class FormService {
    async createForm(data, userId) {
        try {
            const repo = db_1.AppDataSource.getRepository(forms_entity_1.Form);
            const form = repo.create({
                ...data,
                category: data.category,
                createdBy: userId ?? null,
            });
            await repo.save(form);
            logger_1.logger.info(`Form created: ${form.id}`);
            return form;
        }
        catch (error) {
            logger_1.logger.error('Create form error:', error);
            if (error.number === 2627) {
                throw { message: 'Form with this name already exists', statusCode: 409, code: errors_1.ERROR_CODES.DUPLICATE_ERROR };
            }
            throw error;
        }
    }
    async listForms(options) {
        try {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(forms_entity_1.Form);
            const buildQb = () => {
                const qb = repo.createQueryBuilder('f');
                if (options.category)
                    qb.andWhere('f.category = :category', { category: options.category });
                if (options.published !== undefined)
                    qb.andWhere('f.published = :published', { published: options.published });
                if (options.search)
                    qb.andWhere('f.name LIKE :search', { search: `%${options.search}%` });
                return qb;
            };
            const [items, total] = await Promise.all([
                buildQb().orderBy('f.createdAt', 'DESC').skip(skip).take(limit).getMany(),
                buildQb().getCount(),
            ]);
            return { items, total, page, totalPages: Math.ceil(total / limit) };
        }
        catch (error) {
            logger_1.logger.error('List forms error:', error);
            throw error;
        }
    }
    async getFormById(id) {
        try {
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(forms_entity_1.Form);
            const form = await repo.findOne({ where: { id: idNum } });
            if (!form) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Form not found' };
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error('Get form error:', error);
            if (error.statusCode)
                throw error;
            if (isNaN(parseInt(id, 10))) {
                throw { statusCode: 400, code: errors_1.ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
            }
            throw error;
        }
    }
    async updateForm(id, data) {
        try {
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(forms_entity_1.Form);
            const form = await repo.findOne({ where: { id: idNum } });
            if (!form) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Form not found' };
            }
            Object.assign(form, data);
            await repo.save(form);
            logger_1.logger.info(`Form updated: ${id}`);
            return form;
        }
        catch (error) {
            logger_1.logger.error('Update form error:', error);
            if (error.statusCode)
                throw error;
            if (isNaN(parseInt(id, 10))) {
                throw { statusCode: 400, code: errors_1.ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
            }
            throw error;
        }
    }
    async deleteForm(id) {
        try {
            const idNum = parseInt(id, 10);
            const repo = db_1.AppDataSource.getRepository(forms_entity_1.Form);
            const form = await repo.findOne({ where: { id: idNum } });
            if (!form) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Form not found' };
            }
            await repo.remove(form);
            logger_1.logger.info(`Form deleted: ${id}`);
        }
        catch (error) {
            logger_1.logger.error('Delete form error:', error);
            if (error.statusCode)
                throw error;
            if (isNaN(parseInt(id, 10))) {
                throw { statusCode: 400, code: errors_1.ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
            }
            throw error;
        }
    }
}
exports.FormService = FormService;
exports.formService = new FormService();
//# sourceMappingURL=forms.service.js.map