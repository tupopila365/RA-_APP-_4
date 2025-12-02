"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsController = exports.DocumentsController = void 0;
const documents_service_1 = require("./documents.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class DocumentsController {
    /**
     * Upload a new document
     * POST /api/documents
     */
    async uploadDocument(req, res, next) {
        try {
            // Validate file upload
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'PDF file is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate required fields
            const { title, description, category } = req.body;
            if (!title || !description || !category) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Title, description, and category are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate category
            const validCategories = ['policy', 'tender', 'report', 'other'];
            if (!validCategories.includes(category)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Invalid category. Must be one of: policy, tender, report, other',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Create document
            const document = await documents_service_1.documentsService.createDocument({
                title,
                description,
                category,
                uploadedBy: req.user.userId,
            }, req.file);
            logger_1.logger.info(`Document uploaded successfully: ${document._id}`);
            res.status(201).json({
                success: true,
                data: {
                    _id: document._id,
                    title: document.title,
                    description: document.description,
                    fileUrl: document.fileUrl,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    category: document.category,
                    indexed: document.indexed,
                    uploadedBy: document.uploadedBy,
                    createdAt: document.createdAt,
                    updatedAt: document.updatedAt,
                },
                message: 'Document uploaded successfully. Indexing in progress.',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Upload document error:', error);
            next(error);
        }
    }
    /**
     * List all documents with pagination and filtering
     * GET /api/documents
     */
    async listDocuments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category;
            const indexed = req.query.indexed === 'true' ? true : req.query.indexed === 'false' ? false : undefined;
            const search = req.query.search;
            const result = await documents_service_1.documentsService.listDocuments({
                page,
                limit,
                category,
                indexed,
                search,
            });
            res.status(200).json({
                success: true,
                data: {
                    items: result.documents.map((doc) => ({
                        _id: doc._id,
                        title: doc.title,
                        description: doc.description,
                        fileUrl: doc.fileUrl,
                        fileType: doc.fileType,
                        fileSize: doc.fileSize,
                        category: doc.category,
                        indexed: doc.indexed,
                        uploadedBy: doc.uploadedBy,
                        createdAt: doc.createdAt,
                        updatedAt: doc.updatedAt,
                    })),
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('List documents error:', error);
            next(error);
        }
    }
    /**
     * Get a single document by ID
     * GET /api/documents/:id
     */
    async getDocument(req, res, next) {
        try {
            const { id } = req.params;
            const document = await documents_service_1.documentsService.getDocumentById(id);
            res.status(200).json({
                success: true,
                data: {
                    _id: document._id,
                    title: document.title,
                    description: document.description,
                    fileUrl: document.fileUrl,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    category: document.category,
                    indexed: document.indexed,
                    uploadedBy: document.uploadedBy,
                    createdAt: document.createdAt,
                    updatedAt: document.updatedAt,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get document error:', error);
            next(error);
        }
    }
    /**
     * Delete a document
     * DELETE /api/documents/:id
     */
    async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            await documents_service_1.documentsService.deleteDocument(id);
            logger_1.logger.info(`Document deleted: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Document deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete document error:', error);
            next(error);
        }
    }
    /**
     * Get indexing progress for a document
     * GET /api/documents/:id/indexing-progress
     */
    async getIndexingProgress(req, res, next) {
        try {
            const { id } = req.params;
            const progress = await documents_service_1.documentsService.getIndexingProgress(id);
            res.status(200).json({
                success: true,
                data: progress,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get indexing progress error:', error);
            next(error);
        }
    }
}
exports.DocumentsController = DocumentsController;
exports.documentsController = new DocumentsController();
//# sourceMappingURL=documents.controller.js.map