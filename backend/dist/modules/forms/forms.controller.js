"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formController = exports.FormController = void 0;
const forms_service_1 = require("./forms.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class FormController {
    /**
     * Create a new form
     * POST /api/forms
     */
    async createForm(req, res, next) {
        try {
            const { name, category, documents, published } = req.body;
            if (!name || !category || !documents || !Array.isArray(documents) || documents.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Name, category, and at least one document are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const form = await forms_service_1.formService.createForm({
                name,
                category,
                documents,
                published: published === true,
            }, req.user?.userId);
            res.status(201).json({
                success: true,
                data: {
                    form: {
                        id: form.id,
                        name: form.name,
                        category: form.category,
                        documents: form.documents,
                        published: form.published,
                        publishedAt: form.publishedAt,
                        createdAt: form.createdAt,
                        updatedAt: form.updatedAt,
                    },
                    message: 'Form created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create form error:', error);
            next(error);
        }
    }
    /**
     * List forms with pagination, filtering, and search
     * GET /api/forms
     */
    async listForms(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
            const search = req.query.search;
            const result = await forms_service_1.formService.listForms({
                page,
                limit,
                category,
                published,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    items: result.items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        documents: item.documents,
                        published: item.published,
                        publishedAt: item.publishedAt,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
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
            logger_1.logger.error('List forms error:', error);
            next(error);
        }
    }
    /**
     * Get a single form by ID
     * GET /api/forms/:id
     */
    async getForm(req, res, next) {
        try {
            const { id } = req.params;
            const form = await forms_service_1.formService.getFormById(id);
            res.status(200).json({
                success: true,
                data: {
                    form: {
                        id: form.id,
                        name: form.name,
                        category: form.category,
                        documents: form.documents,
                        published: form.published,
                        publishedAt: form.publishedAt,
                        createdAt: form.createdAt,
                        updatedAt: form.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get form error:', error);
            next(error);
        }
    }
    /**
     * Update form
     * PUT /api/forms/:id
     */
    async updateForm(req, res, next) {
        try {
            const { id } = req.params;
            const { name, category, documents, published } = req.body;
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (category !== undefined)
                updateData.category = category;
            if (documents !== undefined)
                updateData.documents = documents;
            if (published !== undefined)
                updateData.published = published === true;
            const form = await forms_service_1.formService.updateForm(id, updateData);
            res.status(200).json({
                success: true,
                data: {
                    form: {
                        id: form.id,
                        name: form.name,
                        category: form.category,
                        documents: form.documents,
                        published: form.published,
                        publishedAt: form.publishedAt,
                        createdAt: form.createdAt,
                        updatedAt: form.updatedAt,
                    },
                    message: 'Form updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update form error:', error);
            next(error);
        }
    }
    /**
     * Delete form
     * DELETE /api/forms/:id
     */
    async deleteForm(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined' || id === 'null') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Form ID is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await forms_service_1.formService.deleteForm(id);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Form deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete form error:', error);
            next(error);
        }
    }
}
exports.FormController = FormController;
exports.formController = new FormController();
//# sourceMappingURL=forms.controller.js.map