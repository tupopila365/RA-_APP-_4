"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsService = void 0;
const db_1 = require("../../config/db");
const documents_entity_1 = require("./documents.entity");
const cloudinary_1 = require("../../config/cloudinary");
const httpClient_1 = require("../../utils/httpClient");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
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
            const repo = db_1.AppDataSource.getRepository(documents_entity_1.Document);
            // Upload file to Cloudinary
            logger_1.logger.info(`Uploading file: ${file.originalname}`);
            const uploadResult = await this.uploadFileToCloudinary(file.buffer, file.originalname);
            const uploadedById = parseInt(dto.uploadedBy, 10);
            const document = repo.create({
                title: dto.title,
                description: dto.description,
                fileUrl: uploadResult.url,
                fileType: file.mimetype,
                fileSize: uploadResult.size,
                category: dto.category,
                indexed: false,
                uploadedById,
            });
            await repo.save(document);
            logger_1.logger.info(`Document created with ID: ${document.id}`);
            // Trigger RAG indexing asynchronously (don't wait for completion)
            this.indexDocumentInRAG(String(document.id), uploadResult.url, dto.title).catch((error) => {
                logger_1.logger.error(`RAG indexing failed for document ${document.id}:`, error);
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
            const repo = db_1.AppDataSource.getRepository(documents_entity_1.Document);
            const id = parseInt(documentId, 10);
            await repo.update({ id }, { indexed: true });
            logger_1.logger.info(`Document ${documentId} marked as indexed`);
        }
        catch (error) {
            // Log detailed error information for debugging
            const errorDetails = error.details || error.message || 'Unknown error';
            const errorCode = error.code || 'UNKNOWN';
            logger_1.logger.error(`Failed to index document ${documentId} in RAG service`, {
                errorCode,
                message: error.message,
                details: errorDetails,
                statusCode: error.statusCode,
                documentId,
                fileUrl,
            });
            // If the error contains diagnostic information, log it
            if (error.details && typeof error.details === 'object') {
                if (error.details.diagnostics) {
                    logger_1.logger.error('RAG Service Diagnostics:', error.details.diagnostics);
                }
                if (error.details.error === 'EMBEDDING_ERROR') {
                    logger_1.logger.error(`Embedding generation failed for document ${documentId}. ` +
                        `This usually indicates: ` +
                        `1. Ollama service is not running, ` +
                        `2. Embedding model is not installed, or ` +
                        `3. Network/connection issues with Ollama. ` +
                        `Check RAG service logs for more details.`);
                }
            }
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
            const repo = db_1.AppDataSource.getRepository(documents_entity_1.Document);
            const where = {};
            if (query.category)
                where.category = query.category;
            if (query.indexed !== undefined)
                where.indexed = query.indexed;
            const [documents, total] = await Promise.all([
                repo.find({
                    where,
                    relations: ['uploadedBy'],
                    order: { createdAt: 'DESC' },
                    skip,
                    take: limit,
                }),
                repo.count({ where }),
            ]);
            return {
                documents,
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
            const id = parseInt(documentId, 10);
            const repo = db_1.AppDataSource.getRepository(documents_entity_1.Document);
            const document = await repo.findOne({
                where: { id },
                relations: ['uploadedBy'],
            });
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
            const id = parseInt(documentId, 10);
            const repo = db_1.AppDataSource.getRepository(documents_entity_1.Document);
            const document = await repo.findOne({ where: { id } });
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
                    const urlParts = document.fileUrl.split('/');
                    const fileNameWithExt = urlParts[urlParts.length - 1];
                    const publicId = `documents/${fileNameWithExt.split('.')[0]}`;
                    await cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                    logger_1.logger.info(`Deleted file from Cloudinary: ${publicId}`);
                }
                catch (cloudinaryError) {
                    logger_1.logger.error('Cloudinary deletion error:', cloudinaryError);
                }
            }
            await repo.remove(document);
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