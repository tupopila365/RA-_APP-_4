"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacanciesController = exports.VacanciesController = void 0;
const vacancies_service_1 = require("./vacancies.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class VacanciesController {
    /**
     * Create a new vacancy
     * POST /api/vacancies
     */
    async createVacancy(req, res, next) {
        try {
            // Validate required fields
            const { title, type, department, location, description, requirements, responsibilities, salary, closingDate, pdfUrl, published, } = req.body;
            if (!title || !type || !department || !location || !description || !requirements || !responsibilities || !closingDate) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Title, type, department, location, description, requirements, responsibilities, and closingDate are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate type
            const validTypes = ['full-time', 'part-time', 'bursary', 'internship'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Type must be one of: full-time, part-time, bursary, internship',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate requirements and responsibilities are arrays
            if (!Array.isArray(requirements) || requirements.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Requirements must be a non-empty array',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Responsibilities must be a non-empty array',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Create vacancy
            const vacancy = await vacancies_service_1.vacanciesService.createVacancy({
                title,
                type,
                department,
                location,
                description,
                requirements,
                responsibilities,
                salary,
                closingDate: new Date(closingDate),
                pdfUrl,
                published: published === true,
            });
            logger_1.logger.info(`Vacancy created successfully: ${vacancy._id}`);
            res.status(201).json({
                success: true,
                data: {
                    vacancy: {
                        id: vacancy._id,
                        title: vacancy.title,
                        type: vacancy.type,
                        department: vacancy.department,
                        location: vacancy.location,
                        description: vacancy.description,
                        requirements: vacancy.requirements,
                        responsibilities: vacancy.responsibilities,
                        salary: vacancy.salary,
                        closingDate: vacancy.closingDate,
                        pdfUrl: vacancy.pdfUrl,
                        published: vacancy.published,
                        createdAt: vacancy.createdAt,
                        updatedAt: vacancy.updatedAt,
                    },
                    message: 'Vacancy created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create vacancy error:', error);
            next(error);
        }
    }
    /**
     * List all vacancies with pagination, filtering, and search
     * GET /api/vacancies
     */
    async listVacancies(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const type = req.query.type;
            const department = req.query.department;
            const location = req.query.location;
            const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
            const search = req.query.search;
            const result = await vacancies_service_1.vacanciesService.listVacancies({
                page,
                limit,
                type,
                department,
                location,
                published,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    vacancies: result.vacancies.map((vacancy) => ({
                        id: vacancy._id,
                        title: vacancy.title,
                        type: vacancy.type,
                        department: vacancy.department,
                        location: vacancy.location,
                        description: vacancy.description,
                        requirements: vacancy.requirements,
                        responsibilities: vacancy.responsibilities,
                        salary: vacancy.salary,
                        closingDate: vacancy.closingDate,
                        pdfUrl: vacancy.pdfUrl,
                        published: vacancy.published,
                        createdAt: vacancy.createdAt,
                        updatedAt: vacancy.updatedAt,
                    })),
                    pagination: {
                        total: result.total,
                        page: result.page,
                        totalPages: result.totalPages,
                        limit,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('List vacancies error:', error);
            next(error);
        }
    }
    /**
     * Get a single vacancy by ID
     * GET /api/vacancies/:id
     */
    async getVacancy(req, res, next) {
        try {
            const { id } = req.params;
            const vacancy = await vacancies_service_1.vacanciesService.getVacancyById(id);
            res.status(200).json({
                success: true,
                data: {
                    vacancy: {
                        id: vacancy._id,
                        title: vacancy.title,
                        type: vacancy.type,
                        department: vacancy.department,
                        location: vacancy.location,
                        description: vacancy.description,
                        requirements: vacancy.requirements,
                        responsibilities: vacancy.responsibilities,
                        salary: vacancy.salary,
                        closingDate: vacancy.closingDate,
                        pdfUrl: vacancy.pdfUrl,
                        published: vacancy.published,
                        createdAt: vacancy.createdAt,
                        updatedAt: vacancy.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vacancy error:', error);
            next(error);
        }
    }
    /**
     * Update a vacancy
     * PUT /api/vacancies/:id
     */
    async updateVacancy(req, res, next) {
        try {
            const { id } = req.params;
            const { title, type, department, location, description, requirements, responsibilities, salary, closingDate, pdfUrl, published, } = req.body;
            // Build update object with only provided fields
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (type !== undefined) {
                const validTypes = ['full-time', 'part-time', 'bursary', 'internship'];
                if (!validTypes.includes(type)) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Type must be one of: full-time, part-time, bursary, internship',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                updateData.type = type;
            }
            if (department !== undefined)
                updateData.department = department;
            if (location !== undefined)
                updateData.location = location;
            if (description !== undefined)
                updateData.description = description;
            if (requirements !== undefined) {
                if (!Array.isArray(requirements) || requirements.length === 0) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Requirements must be a non-empty array',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                updateData.requirements = requirements;
            }
            if (responsibilities !== undefined) {
                if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Responsibilities must be a non-empty array',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                updateData.responsibilities = responsibilities;
            }
            if (salary !== undefined)
                updateData.salary = salary;
            if (closingDate !== undefined)
                updateData.closingDate = new Date(closingDate);
            if (pdfUrl !== undefined)
                updateData.pdfUrl = pdfUrl;
            if (published !== undefined)
                updateData.published = published;
            const vacancy = await vacancies_service_1.vacanciesService.updateVacancy(id, updateData);
            logger_1.logger.info(`Vacancy updated successfully: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    vacancy: {
                        id: vacancy._id,
                        title: vacancy.title,
                        type: vacancy.type,
                        department: vacancy.department,
                        location: vacancy.location,
                        description: vacancy.description,
                        requirements: vacancy.requirements,
                        responsibilities: vacancy.responsibilities,
                        salary: vacancy.salary,
                        closingDate: vacancy.closingDate,
                        pdfUrl: vacancy.pdfUrl,
                        published: vacancy.published,
                        createdAt: vacancy.createdAt,
                        updatedAt: vacancy.updatedAt,
                    },
                    message: 'Vacancy updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update vacancy error:', error);
            next(error);
        }
    }
    /**
     * Delete a vacancy
     * DELETE /api/vacancies/:id
     */
    async deleteVacancy(req, res, next) {
        try {
            const { id } = req.params;
            await vacancies_service_1.vacanciesService.deleteVacancy(id);
            logger_1.logger.info(`Vacancy deleted: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Vacancy deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete vacancy error:', error);
            next(error);
        }
    }
}
exports.VacanciesController = VacanciesController;
exports.vacanciesController = new VacanciesController();
//# sourceMappingURL=vacancies.controller.js.map