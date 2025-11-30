"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacanciesService = void 0;
const vacancies_model_1 = require("./vacancies.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class VacanciesService {
    /**
     * Create a new vacancy
     */
    async createVacancy(dto) {
        try {
            logger_1.logger.info('Creating vacancy:', { title: dto.title });
            const vacancy = await vacancies_model_1.VacancyModel.create({
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
            });
            logger_1.logger.info(`Vacancy created with ID: ${vacancy._id}`);
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
    /**
     * List vacancies with pagination, filtering, and search
     */
    async listVacancies(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.type) {
                filter.type = query.type;
            }
            if (query.department) {
                filter.department = query.department;
            }
            if (query.location) {
                filter.location = query.location;
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [vacancies, total] = await Promise.all([
                vacancies_model_1.VacancyModel.find(filter)
                    .sort({ closingDate: 1, createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                vacancies_model_1.VacancyModel.countDocuments(filter),
            ]);
            return {
                vacancies: vacancies,
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
    /**
     * Get a single vacancy by ID
     */
    async getVacancyById(vacancyId) {
        try {
            const vacancy = await vacancies_model_1.VacancyModel.findById(vacancyId).lean();
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
    /**
     * Update a vacancy
     */
    async updateVacancy(vacancyId, dto) {
        try {
            logger_1.logger.info(`Updating vacancy: ${vacancyId}`);
            const vacancy = await vacancies_model_1.VacancyModel.findByIdAndUpdate(vacancyId, dto, { new: true, runValidators: true }).lean();
            if (!vacancy) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Vacancy not found',
                };
            }
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
    /**
     * Delete a vacancy
     */
    async deleteVacancy(vacancyId) {
        try {
            logger_1.logger.info(`Deleting vacancy: ${vacancyId}`);
            const vacancy = await vacancies_model_1.VacancyModel.findByIdAndDelete(vacancyId);
            if (!vacancy) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Vacancy not found',
                };
            }
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