import { AppDataSource } from '../../config/db';
import { Document } from './documents.entity';
import { fileStorageService } from '../file-storage/file-storage.service';
import { ragService } from '../../utils/httpClient';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateDocumentDTO {
  title: string;
  description: string;
  category: 'policy' | 'tender' | 'report' | 'other';
  uploadedBy: string;
}

export interface ListDocumentsQuery {
  page?: number;
  limit?: number;
  category?: string;
  indexed?: boolean;
  search?: string;
}

export interface ListDocumentsResult {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
}

class DocumentsService {
  /**
   * Upload file to database storage
   */
  private async uploadFileToStorage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; size: number }> {
    try {
      const result = await fileStorageService.storeFile(
        fileBuffer,
        fileName,
        mimeType
      );
      return { url: result.url, size: fileBuffer.length };
    } catch (error: any) {
      logger.error('File upload error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.UPLOAD_FAILED,
        message: 'Failed to upload file',
        details: error.message,
      };
    }
  }

  /**
   * Create a new document with file upload and RAG indexing
   */
  async createDocument(
    dto: CreateDocumentDTO,
    file: Express.Multer.File
  ): Promise<Document> {
    try {
      const repo = AppDataSource.getRepository(Document);
      // Upload file to database storage
      logger.info(`Uploading file: ${file.originalname}`);
      const uploadResult = await this.uploadFileToStorage(
        file.buffer,
        file.originalname,
        file.mimetype
      );

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

      logger.info(`Document created with ID: ${document.id}`);

      // Trigger RAG indexing asynchronously (don't wait for completion)
      this.indexDocumentInRAG(String(document.id), uploadResult.url, dto.title).catch(
        (error) => {
          logger.error(`RAG indexing failed for document ${document.id}:`, error);
        }
      );

      return document;
    } catch (error: any) {
      logger.error('Create document error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create document',
        details: error.message,
      };
    }
  }

  /**
   * Index document in RAG service and update indexed status
   */
  private async indexDocumentInRAG(
    documentId: string,
    fileUrl: string,
    title: string
  ): Promise<void> {
    try {
      logger.info(`Indexing document ${documentId} in RAG service`);
      
      // Call RAG service to index the document
      const result = await ragService.indexDocument(fileUrl, documentId, title);
      
      logger.info(`RAG indexing successful for document ${documentId}:`, result);

      // Update document indexed status
      const repo = AppDataSource.getRepository(Document);
      const id = parseInt(documentId, 10);
      await repo.update({ id }, { indexed: true });
      
      logger.info(`Document ${documentId} marked as indexed`);
    } catch (error: any) {
      // Log detailed error information for debugging
      const errorDetails = error.details || error.message || 'Unknown error';
      const errorCode = error.code || 'UNKNOWN';
      
      logger.error(`Failed to index document ${documentId} in RAG service`, {
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
          logger.error('RAG Service Diagnostics:', error.details.diagnostics);
        }
        if (error.details.error === 'EMBEDDING_ERROR') {
          logger.error(
            `Embedding generation failed for document ${documentId}. ` +
            `This usually indicates: ` +
            `1. Ollama service is not running, ` +
            `2. Embedding model is not installed, or ` +
            `3. Network/connection issues with Ollama. ` +
            `Check RAG service logs for more details.`
          );
        }
      }
      
      // Don't throw - indexing failure shouldn't prevent document creation
      // The document will remain with indexed: false
    }
  }

  /**
   * List documents with pagination and filtering
   */
  async listDocuments(query: ListDocumentsQuery): Promise<ListDocumentsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(Document);

      const where: any = {};
      if (query.category) where.category = query.category;
      if (query.indexed !== undefined) where.indexed = query.indexed;

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
    } catch (error: any) {
      logger.error('List documents error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve documents',
        details: error.message,
      };
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(documentId: string): Promise<Document> {
    try {
      const id = parseInt(documentId, 10);
      const repo = AppDataSource.getRepository(Document);
      const document = await repo.findOne({
        where: { id },
        relations: ['uploadedBy'],
      });

      if (!document) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        };
      }

      return document;
    } catch (error: any) {
      logger.error('Get document error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve document',
        details: error.message,
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const id = parseInt(documentId, 10);
      const repo = AppDataSource.getRepository(Document);
      const document = await repo.findOne({ where: { id } });

      if (!document) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        };
      }

      // Delete from file storage if it's a backend-stored file
      if (fileStorageService.isBackendFileUrl(document.fileUrl)) {
        const fileId = fileStorageService.extractIdFromUrl(document.fileUrl);
        if (fileId) {
          try {
            await fileStorageService.deleteFile(fileId);
            logger.info(`Deleted file from storage: id=${fileId}`);
          } catch (storageError: any) {
            logger.error('File storage deletion error:', storageError);
          }
        }
      }

      await repo.remove(document);
      
      logger.info(`Document ${documentId} deleted successfully`);

      // TODO: In the future, we should also remove the document from RAG service
      // This would require implementing a DELETE endpoint in the RAG service
    } catch (error: any) {
      logger.error('Delete document error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete document',
        details: error.message,
      };
    }
  }

  /**
   * Get indexing progress from RAG service
   */
  async getIndexingProgress(documentId: string): Promise<any> {
    try {
      const progress = await ragService.getIndexingProgress(documentId);
      return progress;
    } catch (error: any) {
      logger.error(`Failed to get indexing progress for document ${documentId}:`, error);
      // Return default progress if RAG service is unavailable
      return {
        status: 'unknown',
        percentage: 0,
        message: 'Unable to retrieve indexing progress',
      };
    }
  }
}

export const documentsService = new DocumentsService();
