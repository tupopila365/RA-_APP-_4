"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacanciesService = void 0;
const db_1 = require("../../config/db");
const vacancies_entity_1 = require("./vacancies.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class VacanciesService {
    async createVacancy(dto) {
        try {
            logger_1.logger.info('Creating vacancy:', { title: dto.title });
            const repo = db_1.AppDataSource.getRepository(vacancies_entity_1.Vacancy);
            const vacancy = repo.create({
                title: dto.title,
                type: dto.type,
                department: dto.department,
                location: dto.location,
                description: dto.description,
                requirements: dto.requirements,
                responsibilities: dto.responsibilities,
                salary: dto.salary,
                closingDate: dto.closingDate,
                pdfUrl: dto.pdfUrl,
                published: dto.published || false,
                contactName: dto.contactName,
                contactEmail: dto.contactEmail,
                contactTelephone: dto.contactTelephone,
                submissionLink: dto.submissionLink,
                submissionEmail: dto.submissionEmail,
                submissionInstructions: dto.submissionInstructions,
            });
            await repo.save(vacancy);
            logger_1.logger.info(`Vacancy created with ID: ${vacancy.id}`);
            return vacancy;
        }
        catch (error) {
            logger_1.logger.error('Create vacancy error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create vacancy',
                details: error.message,
            };
        }
    }
    async listVacancies(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(vacancies_entity_1.Vacancy);
            const where = {};
            if (query.type)
                where.type = query.type;
            if (query.department)
                where.department = query.department;
            if (query.location)
                where.location = query.location;
            if (query.published !== undefined)
                where.published = query.published;
            const buildQb = () => {
                const qb = repo.createQueryBuilder('v');
                if (query.type)
                    qb.andWhere('v.type = :type', { type: query.type });
                if (query.department)
                    qb.andWhere('v.department = :department', { department: query.department });
                if (query.location)
                    qb.andWhere('v.location = :location', { location: query.location });
                if (query.published !== undefined)
                    qb.andWhere('v.published = :published', { published: query.published });
                if (query.search) {
                    qb.andWhere('(v.title LIKE :search OR v.description LIKE :search)', { search: `%${query.search}%` });
                }
                return qb;
            };
            const [vacancies, total] = await Promise.all([
                buildQb().orderBy('v.closingDate', 'ASC').addOrderBy('v.createdAt', 'DESC').skip(skip).take(limit).getMany(),
                buildQb().getCount(),
            ]);
            return {
                vacancies,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List vacancies error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve vacancies',
                details: error.message,
            };
        }
    }
    async getVacancyById(vacancyId) {
        try {
            const id = parseInt(vacancyId, 10);
            const repo = db_1.AppDataSource.getRepository(vacancies_entity_1.Vacancy);
            const vacancy = await repo.findOne({ where: { id } });
            if (!vacancy) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Vacancy not found',
                };
            }
            return vacancy;
        }
        catch (error) {
            logger_1.logger.error('Get vacancy error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve vacancy',
                details: error.message,
            };
        }
    }
    async updateVacancy(vacancyId, dto) {
        try {
            logger_1.logger.info(`Updating vacancy: ${vacancyId}`);
            const id = parseInt(vacancyId, 10);
            const repo = db_1.AppDataSource.getRepository(vacancies_entity_1.Vacancy);
            const vacancy = await repo.findOne({ where: { id } });
            if (!vacancy) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Vacancy not found',
                };
            }
            Object.assign(vacancy, dto);
            if (dto.closingDate)
                vacancy.closingDate = dto.closingDate;
            await repo.save(vacancy);
            logger_1.logger.info(`Vacancy ${vacancyId} updated successfully`);
            return vacancy;
        }
        catch (error) {
            logger_1.logger.error('Update vacancy error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update vacancy',
                details: error.message,
            };
        }
    }
    async deleteVacancy(vacancyId) {
        try {
            logger_1.logger.info(`Deleting vacancy: ${vacancyId}`);
            const id = parseInt(vacancyId, 10);
            const repo = db_1.AppDataSource.getRepository(vacancies_entity_1.Vacancy);
            const vacancy = await repo.findOne({ where: { id } });
            if (!vacancy) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Vacancy not found',
                };
            }
            await repo.remove(vacancy);
            logger_1.logger.info(`Vacancy ${vacancyId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete vacancy error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete vacancy',
                details: error.message,
            };
        }
    }
}
exports.vacanciesService = new VacanciesService();
//# sourceMappingURL=vacancies.service.js.map