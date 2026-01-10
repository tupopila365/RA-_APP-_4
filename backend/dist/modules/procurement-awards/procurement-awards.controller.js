"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procurementAwardController = exports.ProcurementAwardController = void 0;
const procurement_awards_service_1 = require("./procurement-awards.service");
const upload_service_1 = require("../upload/upload.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ProcurementAwardController {
    /**
     * Create a new procurement award
     * POST /api/procurement-awards
     */
    async createAward(req, res, next) {
        try {
            const { type, procurementReference, description, executiveSummary, successfulBidder, dateAwarded, published, } = req.body;
            if (!type ||
                !procurementReference ||
                !description ||
                !executiveSummary ||
                !successfulBidder ||
                !dateAwarded) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Type, procurementReference, description, executiveSummary, successfulBidder, and dateAwarded are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const award = await procurement_awards_service_1.procurementAwardService.createAward({
                type,
                procurementReference,
                description,
                executiveSummary,
                successfulBidder,
                dateAwarded: new Date(dateAwarded),
                published: published === true,
            }, req.user?.userId);
            res.status(201).json({
                success: true,
                data: {
                    award: {
                        id: award._id,
                        type: award.type,
                        procurementReference: award.procurementReference,
                        description: award.description,
                        executiveSummary: award.executiveSummary,
                        successfulBidder: award.successfulBidder,
                        dateAwarded: award.dateAwarded,
                        published: award.published,
                        publishedAt: award.publishedAt,
                        createdAt: award.createdAt,
                        updatedAt: award.updatedAt,
                    },
                    message: 'Procurement award created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create procurement award error:', error);
            next(error);
        }
    }
    /**
     * List procurement awards with pagination, filtering, and search
     * GET /api/procurement-awards
     */
    async listAwards(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const type = req.query.type;
            const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
            const search = req.query.search;
            const result = await procurement_awards_service_1.procurementAwardService.listAwards({
                page,
                limit,
                type: type,
                published,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    items: result.items.map((item) => ({
                        id: item._id,
                        type: item.type,
                        procurementReference: item.procurementReference,
                        description: item.description,
                        executiveSummary: item.executiveSummary,
                        successfulBidder: item.successfulBidder,
                        dateAwarded: item.dateAwarded,
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
            logger_1.logger.error('List procurement awards error:', error);
            next(error);
        }
    }
    /**
     * Get a single procurement award by ID
     * GET /api/procurement-awards/:id
     */
    async getAward(req, res, next) {
        try {
            const { id } = req.params;
            const award = await procurement_awards_service_1.procurementAwardService.getAwardById(id);
            res.status(200).json({
                success: true,
                data: {
                    award: {
                        id: award._id,
                        type: award.type,
                        procurementReference: award.procurementReference,
                        description: award.description,
                        executiveSummary: award.executiveSummary,
                        successfulBidder: award.successfulBidder,
                        dateAwarded: award.dateAwarded,
                        published: award.published,
                        publishedAt: award.publishedAt,
                        createdAt: award.createdAt,
                        updatedAt: award.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get procurement award error:', error);
            next(error);
        }
    }
    /**
     * Update procurement award
     * PUT /api/procurement-awards/:id
     */
    async updateAward(req, res, next) {
        try {
            const { id } = req.params;
            const { type, procurementReference, description, executiveSummary, successfulBidder, dateAwarded, published, } = req.body;
            const updateData = {};
            if (type !== undefined)
                updateData.type = type;
            if (procurementReference !== undefined)
                updateData.procurementReference = procurementReference;
            if (description !== undefined)
                updateData.description = description;
            if (executiveSummary !== undefined)
                updateData.executiveSummary = executiveSummary;
            if (successfulBidder !== undefined)
                updateData.successfulBidder = successfulBidder;
            if (dateAwarded !== undefined)
                updateData.dateAwarded = new Date(dateAwarded);
            if (published !== undefined)
                updateData.published = published === true;
            const award = await procurement_awards_service_1.procurementAwardService.updateAward(id, updateData);
            res.status(200).json({
                success: true,
                data: {
                    award: {
                        id: award._id,
                        type: award.type,
                        procurementReference: award.procurementReference,
                        description: award.description,
                        executiveSummary: award.executiveSummary,
                        successfulBidder: award.successfulBidder,
                        dateAwarded: award.dateAwarded,
                        published: award.published,
                        publishedAt: award.publishedAt,
                        createdAt: award.createdAt,
                        updatedAt: award.updatedAt,
                    },
                    message: 'Procurement award updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update procurement award error:', error);
            next(error);
        }
    }
    /**
     * Delete procurement award
     * DELETE /api/procurement-awards/:id
     */
    async deleteAward(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined' || id === 'null') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Procurement award ID is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            await procurement_awards_service_1.procurementAwardService.deleteAward(id);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Procurement award deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete procurement award error:', error);
            next(error);
        }
    }
    /**
     * Bulk upload executive summary documents for procurement awards
     * POST /api/procurement-awards/bulk-upload
     * Note: This uploads only the executive summary documents. The award records must be created separately.
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
                        title: file.originalname.replace(/\.[^/.]+$/, ''),
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
                    note: 'Use these file URLs to create procurement award records',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Bulk upload procurement awards error:', error);
            next(error);
        }
    }
}
exports.ProcurementAwardController = ProcurementAwardController;
exports.procurementAwardController = new ProcurementAwardController();
//# sourceMappingURL=procurement-awards.controller.js.map