import { DocumentModel, IDocument } from './documents.model';
import { cloudinary } from '../../config/cloudinary';
import { ragService } from '../../utils/httpClient';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import mongoose from 'mongoose';

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
  documents: IDocument[];
  total: number;
  page: number;
  totalPages: number;
}

class DocumentsService {
  /**
   * Upload file to Cloudinary
   */
  async uploadFileToCloudinary(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<{ url: string; publicId: string; size: number }> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'documents',
            resource_type: 'raw',
            public_id: `doc_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
            format: 'pdf',
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject({
                statusCode: 500,
                code: ERROR_CODES.UPLOAD_FAILED,
                message: 'Failed to upload file to cloud storage',
                details: error.message,
              });
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                size: result.bytes,
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
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
  ): Promise<IDocument> {
    try {
      // Upload file to Cloudinary
      logger.info(`Uploading file: ${file.originalname}`);
      const uploadResult = await this.uploadFileToCloudinary(file.buffer, file.originalname);

      // Create document in database
      const document = await DocumentModel.create({
        title: dto.title,
        description: dto.description,
        fileUrl: uploadResult.url,
        fileType: file.mimetype,
        fileSize: uploadResult.size,
        category: dto.category,
        indexed: false,
        uploadedBy: new mongoose.Types.ObjectId(dto.uploadedBy),
      });

      logger.info(`Document created with ID: ${document._id}`);

      // Trigger RAG indexing asynchronously (don't wait for completion)
      this.indexDocumentInRAG(document._id.toString(), uploadResult.url, dto.title).catch(
        (error) => {
          logger.error(`RAG indexing failed for document ${document._id}:`, error);
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
      await DocumentModel.findByIdAndUpdate(documentId, { indexed: true });
      
      logger.info(`Document ${documentId} marked as indexed`);
    } catch (error: any) {
      logger.error(`Failed to index document ${documentId} in RAG:`, error);
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

      // Build filter
      const filter: any = {};
      
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
        DocumentModel.find(filter)
          .populate('uploadedBy', 'email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DocumentModel.countDocuments(filter),
      ]);

      return {
        documents: documents as unknown as IDocument[],
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
  async getDocumentById(documentId: string): Promise<IDocument> {
    try {
      const document = await DocumentModel.findById(documentId)
        .populate('uploadedBy', 'email')
        .lean();

      if (!document) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Document not found',
        };
      }

      return document as unknown as IDocument;
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
      const document = await DocumentModel.findById(documentId);

      if (!document) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
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
          
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          logger.info(`Deleted file from Cloudinary: ${publicId}`);
        } catch (cloudinaryError: any) {
          logger.error('Cloudinary deletion error:', cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }

      // Delete from database
      await DocumentModel.findByIdAndDelete(documentId);
      
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
