import { fileStorageService } from '../file-storage/file-storage.service';
import { logger } from '../../utils/logger';
import {
  UploadErrorType,
  createUploadError,
  safeSerialize,
  extractFileMetadata,
} from './upload.errors';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface PDFUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class UploadService {
  private readonly ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate image file
   */
  validateImage(file: Express.Multer.File): ValidationResult {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    if (file.size > this.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      };
    }
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_IMAGE_FORMATS.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${this.ALLOWED_IMAGE_FORMATS.join(', ')}`,
      };
    }
    if (!file.mimetype.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }
    return { valid: true };
  }

  /**
   * Validate PDF file
   */
  validatePDF(file: Express.Multer.File): ValidationResult {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    if (file.size > this.MAX_PDF_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.MAX_PDF_SIZE / 1024 / 1024}MB`,
      };
    }
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      return { valid: false, error: 'Invalid file format. Only PDF files are allowed' };
    }
    if (file.mimetype !== 'application/pdf') {
      return { valid: false, error: 'File must be a PDF' };
    }
    return { valid: true };
  }

  /**
   * Upload image to database storage
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    logger.info(`Uploading image: ${file.originalname}`);

    try {
      const format = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const result = await fileStorageService.storeFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      logger.info(`Image uploaded successfully: id=${result.id}`);

      return {
        url: result.url,
        publicId: result.id.toString(),
        width: 0,
        height: 0,
        format,
        bytes: file.size,
      };
    } catch (error) {
      logger.error('Error uploading image:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      throw new Error('Failed to upload image: Unknown error');
    }
  }

  /**
   * Upload PDF to database storage
   */
  async uploadPDF(file: Express.Multer.File, userInfo?: { userId: string; email: string }): Promise<PDFUploadResult> {
    const fileMetadata = extractFileMetadata(file);

    const validation = this.validatePDF(file);
    if (!validation.valid) {
      throw createUploadError(
        UploadErrorType.VALIDATION_ERROR,
        validation.error!,
        fileMetadata
      );
    }

    logger.info('PDF upload initiated', {
      operation: 'pdf_upload',
      status: 'initiated',
      ...fileMetadata,
      ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await fileStorageService.storeFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const format = file.originalname.split('.').pop()?.toLowerCase() ?? 'pdf';

      logger.info('PDF upload successful', {
        operation: 'pdf_upload',
        status: 'success',
        ...fileMetadata,
        publicId: result.id.toString(),
        url: result.url,
        bytes: file.size,
        format,
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });

      return {
        url: result.url,
        publicId: result.id.toString(),
        format,
        bytes: file.size,
      };
    } catch (error) {
      return this.handleUploadError(error, file, userInfo);
    }
  }

  /**
   * Handle upload errors with proper categorization and logging
   */
  private handleUploadError(error: any, file: Express.Multer.File, userInfo?: { userId: string; email: string }): never {
    const fileMetadata = extractFileMetadata(file);

    if (error.type) {
      logger.error('Upload error', {
        operation: 'pdf_upload',
        status: 'failed',
        errorType: error.type,
        message: error.message,
        ...fileMetadata,
        details: error.details,
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (error instanceof Error) {
      logger.error('Upload error', {
        operation: 'pdf_upload',
        status: 'failed',
        errorType: UploadErrorType.STORAGE_ERROR,
        message: error.message,
        stack: error.stack,
        ...fileMetadata,
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });
      throw createUploadError(
        UploadErrorType.STORAGE_ERROR,
        error.message,
        { ...fileMetadata, originalError: { message: error.message, stack: error.stack } }
      );
    }

    const serializedError = safeSerialize(error);
    logger.error('Unknown error object', {
      operation: 'pdf_upload',
      status: 'failed',
      errorType: UploadErrorType.UNKNOWN_ERROR,
      error: serializedError,
      ...fileMetadata,
      ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
      timestamp: new Date().toISOString(),
    });
    throw createUploadError(
      UploadErrorType.UNKNOWN_ERROR,
      'An unknown error occurred during upload',
      { ...fileMetadata, originalError: serializedError }
    );
  }

  /**
   * Delete image from database storage
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      const id = parseInt(publicId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid file ID');
      }
      logger.info(`Deleting image: ${publicId}`);
      const deleted = await fileStorageService.deleteFile(id);
      if (!deleted) {
        throw new Error('File not found');
      }
      logger.info(`Image deleted successfully: ${publicId}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Delete PDF from database storage
   */
  async deletePDF(publicId: string, userInfo?: { userId: string; email: string }): Promise<void> {
    try {
      const id = parseInt(publicId, 10);
      if (isNaN(id)) {
        throw new Error('Invalid file ID');
      }

      logger.info('PDF deletion initiated', {
        operation: 'pdf_deletion',
        status: 'initiated',
        publicId,
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });

      const deleted = await fileStorageService.deleteFile(id);
      if (!deleted) {
        throw new Error('File not found');
      }

      logger.info('PDF deletion successful', {
        operation: 'pdf_deletion',
        status: 'success',
        publicId,
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('PDF deletion failed', {
        operation: 'pdf_deletion',
        status: 'failed',
        publicId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ...(userInfo && { userId: userInfo.userId, userEmail: userInfo.email }),
        timestamp: new Date().toISOString(),
      });
      throw new Error('Failed to delete PDF');
    }
  }
}

export const uploadService = new UploadService();
