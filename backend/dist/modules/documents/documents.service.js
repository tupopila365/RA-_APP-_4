"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsService = void 0;
const documents_model_1 = require("./documents.model");
const cloudinary_1 = require("../../config/cloudinary");
const httpClient_1 = require("../../utils/httpClient");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const mongoose_1 = __importDefault(require("mongoose"));
class DocumentsService {
    /**
     * Upload file to Cloudinary
     */
    async uploadFileToCloudinary(fileBuffer, fileName) {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({
                    folder: 'documents',
                    resource_type: 'raw',
                    public_id: `doc_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
                    format: 'pdf',
                }, (error, result) => {
                    if (error) {
                        logger_1.logger.error('Cloudinary upload error:', error);
                        reject({
                            statusCode: 500,
                            code: errors_1.ERROR_CODES.UPLOAD_FAILED,
                            message: 'Failed to upload file to cloud storage',
                            details: error.message,
                        });
                    }
                    else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            size: result.bytes,
                        });
                    }
                });
                uploadStream.end(fileBuffer);
            });
        }
        catch (error) {
            logger_1.logger.error('File upload error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.UPLOAD_FAILED,
                message: 'Failed to upload file',
                details: error.message,
            };
        }
    }
    /**
     * Create a new document with file upload and RAG indexing
     */
    async createDocument(dto, file) {
        try {
            // Upload file to Cloudinary
            logger_1.logger.info(`Uploading file: ${file.originalname}`);
            const uploadResult = await this.uploadFileToCloudinary(file.buffer, file.originalname);
            // Create document in database
            const document = await documents_model_1.DocumentModel.create({
                title: dto.title,
                description: dto.description,
                fileUrl: uploadResult.url,
                fileType: file.mimetype,
                fileSize: uploadResult.size,
                category: dto.category,
                indexed: false,
                uploadedBy: new mongoose_1.default.Types.ObjectId(dto.uploadedBy),
            });
            logger_1.logger.info(`Document created with ID: ${document._id}`);
            // Trigger RAG indexing asynchronously (don't wait for completion)
            this.indexDocumentInRAG(document._id.toString(), uploadResult.url, dto.title).catch((error) => {
                logger_1.logger.error(`RAG indexing failed for document ${document._id}:`, error);
            });
            return document;
        }
        catch (error) {
            logger_1.logger.error('Create document error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create document',
                details: error.message,
            };
        }
    }
    /**
     * Index document in RAG service and update indexed status
     */
    async indexDocumentInRAG(documentId, fileUrl, title) {
        try {
            logger_1.logger.info(`Indexing document ${documentId} in RAG service`);
            // Call RAG service to index the document
            const result = await httpClient_1.ragService.indexDocument(fileUrl, documentId, title);
            logger_1.logger.info(`RAG indexing successful for document ${documentId}:`, result);
            // Update document indexed status
            await documents_model_1.DocumentModel.findByIdAndUpdate(documentId, { indexed: true });
            logger_1.logger.info(`Document ${documentId} marked as indexed`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to index document ${documentId} in RAG:`, error);
            // Don't throw - indexing failure shouldn't prevent document creation
            // The document will remain with indexed: false
        }
    }
    /**
     * List documents with pagination and filtering
     */
    async listDocuments(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (query.category) {
                filter.category = query.category;
            }
            if (query.indexed !== undefined) {
                filter.indexed = query.indexed;
            }
            if (query.search) {
                filter.$text = { $search: query.search };
            }
            // Execute query with pagination
            const [documents, total] = await Promise.all([
                documents_model_1.DocumentModel.find(filter)
                    .populate('uploadedBy', 'email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                documents_model_1.DocumentModel.countDocuments(filter),
            ]);
            return {
                documents: documents,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.logger.error('List documents error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve documents',
                details: error.message,
            };
        }
    }
    /**
     * Get a single document by ID
     */
    async getDocumentById(documentId) {
        try {
            const document = await documents_model_1.DocumentModel.findById(documentId)
                .populate('uploadedBy', 'email')
                .lean();
            if (!document) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Document not found',
                };
            }
            return document;
        }
        catch (error) {
            logger_1.logger.error('Get document error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve document',
                details: error.message,
            };
        }
    }
    /**
     * Delete a document
     */
    async deleteDocument(documentId) {
        try {
            const document = await documents_model_1.DocumentModel.findById(documentId);
            if (!document) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Document not found',
                };
            }
            // Delete from Cloudinary if it has a public_id
            if (document.fileUrl.includes('cloudinary.com')) {
                try {
                    // Extract public_id from URL
                    const urlParts = document.fileUrl.split('/');
                    const fileNameWithExt = urlParts[urlParts.length - 1];
                    const publicId = `documents/${fileNameWithExt.split('.')[0]}`;
                    await cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                    logger_1.logger.info(`Deleted file from Cloudinary: ${publicId}`);
                }
                catch (cloudinaryError) {
                    logger_1.logger.error('Cloudinary deletion error:', cloudinaryError);
                    // Continue with database deletion even if Cloudinary deletion fails
                }
            }
            // Delete from database
            await documents_model_1.DocumentModel.findByIdAndDelete(documentId);
            logger_1.logger.info(`Document ${documentId} deleted successfully`);
            // TODO: In the future, we should also remove the document from RAG service
            // This would require implementing a DELETE endpoint in the RAG service
        }
        catch (error) {
            logger_1.logger.error('Delete document error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete document',
                details: error.message,
            };
        }
    }
    /**
     * Get indexing progress from RAG service
     */
    async getIndexingProgress(documentId) {
        try {
            const progress = await httpClient_1.ragService.getIndexingProgress(documentId);
            return progress;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get indexing progress for document ${documentId}:`, error);
            // Return default progress if RAG service is unavailable
            return {
                status: 'unknown',
                percentage: 0,
                message: 'Unable to retrieve indexing progress',
            };
        }
    }
}
exports.documentsService = new DocumentsService();
//# sourceMappingURL=documents.service.js.map