"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementOpeningRegisterController = exports.ProcurementOpeningRegisterController = void 0;
const procurement_opening_register_service_1 = require("./procurement-opening-register.service");
const upload_service_1 = require("../upload/upload.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementOpeningRegisterController {
    /**
     * Create a new procurement opening register item
     * POST /api/procurement-opening-register
     */
    async createItem(req, res, next) {
        try {
            const { type, reference, description, bidOpeningDate, status, noticeUrl, noticeFileName, category, published, } = req.body;
            if (!type ||
                !reference ||
                !description ||
                !bidOpeningDate ||
                !status ||
                !noticeUrl ||
                !noticeFileName) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Type, reference, description, bidOpeningDate, status, noticeUrl, and noticeFileName are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const item = await procurement_opening_register_service_1.procurementOpeningRegisterService.createItem({
                type,
                reference,
                description,
                bidOpeningDate: new Date(bidOpeningDate),
                status,
                noticeUrl,
                noticeFileName,
                category,
                published: published === true,
            }, req.user?.userId);
            res.status(201).json({
                success: true,
                data: {
                    item: {
                        id: item._id,
                        type: item.type,
                        reference: item.reference,
                        description: item.description,
                        bidOpeningDate: item.bidOpeningDate,
                        status: item.status,
                        noticeUrl: item.noticeUrl,
                        noticeFileName: item.noticeFileName,
                        category: item.category,
                        published: item.published,
                        publishedAt: item.publishedAt,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    },
                    message: 'Procurement opening register item created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create procurement opening register error:', error);
            next(error);
        }
    }
    /**
     * List procurement opening register items with pagination, filtering, and search
     * GET /api/procurement-opening-register
     */
    async listItems(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const type = req.query.type;
            const status = req.query.status;
            const category = req.query.category;
            const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
            const search = req.query.search;
            const result = await procurement_opening_register_service_1.procurementOpeningRegisterService.listItems({
                page,
                limit,
                type: type,
                status: status,
                category: category,
                published,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    items: result.items.map((item) => ({
                        id: item._id,
                        type: item.type,
                        reference: item.reference,
                        description: item.description,
                        bidOpeningDate: item.bidOpeningDate,
                        status: item.status,
                        noticeUrl: item.noticeUrl,
                        noticeFileName: item.noticeFileName,
                        category: item.category,
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
            logger_1.logger.error('List procurement opening register error:', error);
            next(error);
        }
    }
    /**
     * Get a single procurement opening register item by ID
     * GET /api/procurement-opening-register/:id
     */
    async getItem(req, res, next) {
        try {
            const { id } = req.params;
            const item = await procurement_opening_register_service_1.procurementOpeningRegisterService.getItemById(id);
            res.status(200).json({
                success: true,
                data: {
                    item: {
                        id: item._id,
                        type: item.type,
                        reference: item.reference,
                        description: item.description,
                        bidOpeningDate: item.bidOpeningDate,
                        status: item.status,
                        noticeUrl: item.noticeUrl,
                        noticeFileName: item.noticeFileName,
                        category: item.category,
                        published: item.published,
                        publishedAt: item.publishedAt,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get procurement opening register error:', error);
            next(error);
        }
    }
    /**
     * Update procurement opening register item
     * PUT /api/procurement-opening-register/:id
     */
    async updateItem(req, res, next) {
        try {
            const { id } = req.params;
            const { type, reference, description, bidOpeningDate, status, noticeUrl, noticeFileName, category, published, } = req.body;
            const updateData = {};
            if (type !== undefined)
                updateData.type = type;
            if (reference !== undefined)
                updateData.reference = reference;
            if (description !== undefined)
                updateData.description = description;
            if (bidOpeningDate !== undefined)
                updateData.bidOpeningDate = new Date(bidOpeningDate);
            if (status !== undefined)
                updateData.status = status;
            if (noticeUrl !== undefined)
                updateData.noticeUrl = noticeUrl;
            if (noticeFileName !== undefined)
                updateData.noticeFileName = noticeFileName;
            if (category !== undefined)
                updateData.category = category;
            if (published !== undefined)
                updateData.published = published === true;
            const item = await procurement_opening_register_service_1.procurementOpeningRegisterService.updateItem(id, updateData);
            res.status(200).json({
                success: true,
                data: {
                    item: {
                        id: item._id,
                        type: item.type,
                        reference: item.reference,
                        description: item.description,
                        bidOpeningDate: item.bidOpeningDate,
                        status: item.status,
                        noticeUrl: item.noticeUrl,
                        noticeFileName: item.noticeFileName,
                        category: item.category,
                        published: item.published,
                        publishedAt: item.publishedAt,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    },
                    message: 'Procurement opening register item updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update procurement opening register error:', error);
            next(error);
        }
    }
    /**
     * Delete procurement opening register item
     * DELETE /api/procurement-opening-register/:id
     */
    async deleteItem(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined' || id === 'null') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Procurement opening register item ID is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await procurement_opening_register_service_1.procurementOpeningRegisterService.deleteItem(id);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Procurement opening register item deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete procurement opening register error:', error);
            next(error);
        }
    }
    /**
     * Bulk upload procurement opening register notices
     * POST /api/procurement-opening-register/bulk-upload
     */
    async bulkUpload(req, res, next) {
        try {
            const files = req.files;
            const { type, published } = req.body;
            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'No files provided',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (files.length > 10) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Maximum of 10 files allowed per upload',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (!type) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Type is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const uploadedFiles = [];
            const errors = [];
            // Upload files sequentially
            for (let i = 0; i < files.length; i++) {
                try {
                    const file = files[i];
                    // Upload PDF to Cloudinary
                    const uploadResult = await upload_service_1.uploadService.uploadPDF(file, {
                        userId: req.user?.userId || '',
                        email: req.user?.email || '',
                    });
                    uploadedFiles.push({
                        fileName: file.originalname,
                        url: uploadResult.url,
                        publicId: uploadResult.publicId,
                    });
                }
                catch (error) {
                    logger_1.logger.error(`Error uploading file ${files[i].originalname}:`, error);
                    errors.push({
                        fileName: files[i].originalname,
                        error: error.message || 'Unknown error',
                    });
                }
            }
            res.status(200).json({
                success: true,
                data: {
                    files: uploadedFiles,
                    errors: errors.length > 0 ? errors : undefined,
                    message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} files`,
                    note: 'Use these file URLs to create procurement opening register records',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Bulk upload procurement opening register error:', error);
            next(error);
        }
    }
}
exports.ProcurementOpeningRegisterController = ProcurementOpeningRegisterController;
exports.procurementOpeningRegisterController = new ProcurementOpeningRegisterController();
//# sourceMappingURL=procurement-opening-register.controller.js.map