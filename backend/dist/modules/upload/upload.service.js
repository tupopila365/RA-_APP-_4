"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("../../config/cloudinary");
const logger_1 = require("../../utils/logger");
const upload_errors_1 = require("./upload.errors");
class UploadService {
    constructor() {
        this.ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        this.MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
        this.UPLOAD_FOLDER = 'roads-authority';
    }
    /**
     * Validate image file
     */
    validateImage(file) {
        // Check if file exists
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        // Check file size
        if (file.size > this.MAX_IMAGE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
            };
        }
        // Check file type
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !this.ALLOWED_IMAGE_FORMATS.includes(fileExtension)) {
            return {
                valid: false,
                error: `Invalid file format. Allowed formats: ${this.ALLOWED_IMAGE_FORMATS.join(', ')}`,
            };
        }
        // Check mimetype
        if (!file.mimetype.startsWith('image/')) {
            return {
                valid: false,
                error: 'File must be an image',
            };
        }
        return { valid: true };
    }
    /**
     * Validate PDF file
     */
    validatePDF(file) {
        // Check if file exists
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        // Check file size
        if (file.size > this.MAX_PDF_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum limit of ${this.MAX_PDF_SIZE / 1024 / 1024}MB`,
            };
        }
        // Check file type
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (fileExtension !== 'pdf') {
            return {
                valid: false,
                error: 'Invalid file format. Only PDF files are allowed',
            };
        }
        // Check mimetype
        if (file.mimetype !== 'application/pdf') {
            return {
                valid: false,
                error: 'File must be a PDF',
            };
        }
        return { valid: true };
    }
    /**
     * Upload image to Cloudinary
     */
    async uploadImage(file) {
        try {
            // Check if Cloudinary is configured
            if (!(0, cloudinary_1.isCloudinaryConfigured)()) {
                throw new Error('Cloudinary is not configured. Please check your environment variables.');
            }
            // Validate file first
            const validation = this.validateImage(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            logger_1.logger.info(`Uploading image: ${file.originalname}`);
            // Convert buffer to base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            // Upload to Cloudinary with transformations
            const result = await cloudinary_1.cloudinary.uploader.upload(dataURI, {
                folder: this.UPLOAD_FOLDER,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            });
            logger_1.logger.info(`Image uploaded successfully: ${result.public_id}`);
            return {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
            };
        }
        catch (error) {
            logger_1.logger.error('Error uploading image to Cloudinary:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to upload image: ${error.message}`);
            }
            throw new Error('Failed to upload image: Unknown error');
        }
    }
    /**
     * Validate PDF upload result contains all required metadata
     */
    validatePDFUploadResult(result, file) {
        // Required fields for PDF uploads - format is optional as Cloudinary may not return it for raw resource types
        const requiredFields = ['secure_url', 'public_id', 'bytes'];
        const missingFields = requiredFields.filter(field => !result[field]);
        if (missingFields.length > 0) {
            const fileMetadata = (0, upload_errors_1.extractFileMetadata)(file);
            logger_1.logger.error('Incomplete upload response from Cloudinary', {
                missingFields,
                ...fileMetadata,
                receivedFields: Object.keys(result),
                timestamp: new Date().toISOString(),
            });
            throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.CLOUDINARY_ERROR, `Incomplete upload response: missing fields ${missingFields.join(', ')}`, { ...fileMetadata, missingFields, receivedFields: Object.keys(result) });
        }
        // For raw resource types (PDFs), Cloudinary may not return format field
        // Use fallback: result.format ?? file extension ?? 'pdf'
        const pdfFormat = result.format ?? file.originalname.split('.').pop()?.toLowerCase() ?? 'pdf';
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: pdfFormat,
            bytes: result.bytes,
        };
    }
    /**
     * Upload PDF to Cloudinary
     */
    async uploadPDF(file, userInfo) {
        const fileMetadata = (0, upload_errors_1.extractFileMetadata)(file);
        try {
            // Check if Cloudinary is configured
            if (!(0, cloudinary_1.isCloudinaryConfigured)()) {
                throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.CONFIGURATION_ERROR, 'Cloudinary is not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.', fileMetadata);
            }
            // Validate file first
            const validation = this.validatePDF(file);
            if (!validation.valid) {
                throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.VALIDATION_ERROR, validation.error, fileMetadata);
            }
            // Log upload initiation with file metadata and user info
            logger_1.logger.info('PDF upload initiated', {
                operation: 'pdf_upload',
                status: 'initiated',
                ...fileMetadata,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            // Convert buffer to base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            // Upload to Cloudinary
            // Use 'raw' resource type for PDFs - Cloudinary will auto-detect the format
            const result = await cloudinary_1.cloudinary.uploader.upload(dataURI, {
                folder: `${this.UPLOAD_FOLDER}/pdfs`,
                resource_type: 'raw', // Use 'raw' for PDFs
            });
            // Validate response contains all required metadata
            const validatedResult = this.validatePDFUploadResult(result, file);
            // Log successful upload with Cloudinary response
            logger_1.logger.info('PDF upload successful', {
                operation: 'pdf_upload',
                status: 'success',
                ...fileMetadata,
                publicId: validatedResult.publicId,
                url: validatedResult.url,
                bytes: validatedResult.bytes,
                format: validatedResult.format,
                cloudinaryResponse: {
                    publicId: result.public_id,
                    secureUrl: result.secure_url,
                    resourceType: result.resource_type,
                    createdAt: result.created_at,
                },
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            return validatedResult;
        }
        catch (error) {
            return this.handleUploadError(error, file, userInfo);
        }
    }
    /**
     * Handle upload errors with proper categorization and logging
     */
    handleUploadError(error, file, userInfo) {
        const fileMetadata = (0, upload_errors_1.extractFileMetadata)(file);
        // Already an UploadError - just log and re-throw
        if (error.type) {
            // Log failed upload with error details and file metadata
            logger_1.logger.error('Upload error', {
                operation: 'pdf_upload',
                status: 'failed',
                errorType: error.type,
                message: error.message,
                ...fileMetadata,
                details: error.details,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            throw error;
        }
        // Cloudinary specific errors (have http_code property)
        if (error.http_code) {
            logger_1.logger.error('Cloudinary API error', {
                operation: 'pdf_upload',
                status: 'failed',
                errorType: upload_errors_1.UploadErrorType.CLOUDINARY_ERROR,
                httpCode: error.http_code,
                message: error.message,
                ...fileMetadata,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.CLOUDINARY_ERROR, `Cloudinary error: ${error.message}`, { ...fileMetadata, cloudinaryError: { http_code: error.http_code, message: error.message } });
        }
        // Network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            logger_1.logger.error('Network error', {
                operation: 'pdf_upload',
                status: 'failed',
                errorType: upload_errors_1.UploadErrorType.NETWORK_ERROR,
                code: error.code,
                message: error.message,
                ...fileMetadata,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.NETWORK_ERROR, `Network error: ${error.message}`, { ...fileMetadata, originalError: { code: error.code, message: error.message } });
        }
        // Standard Error instances
        if (error instanceof Error) {
            logger_1.logger.error('Upload error', {
                operation: 'pdf_upload',
                status: 'failed',
                errorType: upload_errors_1.UploadErrorType.UNKNOWN_ERROR,
                message: error.message,
                stack: error.stack,
                ...fileMetadata,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.UNKNOWN_ERROR, error.message, { ...fileMetadata, originalError: { message: error.message, stack: error.stack } });
        }
        // Non-Error objects (serialize safely)
        const serializedError = (0, upload_errors_1.safeSerialize)(error);
        logger_1.logger.error('Unknown error object', {
            operation: 'pdf_upload',
            status: 'failed',
            errorType: upload_errors_1.UploadErrorType.UNKNOWN_ERROR,
            error: serializedError,
            ...fileMetadata,
            ...(userInfo && {
                userId: userInfo.userId,
                userEmail: userInfo.email,
            }),
            timestamp: new Date().toISOString(),
        });
        throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.UNKNOWN_ERROR, 'An unknown error occurred during upload', { ...fileMetadata, originalError: serializedError });
    }
    /**
     * Delete image from Cloudinary
     */
    async deleteImage(publicId) {
        try {
            logger_1.logger.info(`Deleting image: ${publicId}`);
            await cloudinary_1.cloudinary.uploader.destroy(publicId);
            logger_1.logger.info(`Image deleted successfully: ${publicId}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting image from Cloudinary:', error);
            throw new Error('Failed to delete image');
        }
    }
    /**
     * Delete PDF from Cloudinary
     */
    async deletePDF(publicId, userInfo) {
        try {
            // Log deletion request with publicId and user info
            logger_1.logger.info('PDF deletion initiated', {
                operation: 'pdf_deletion',
                status: 'initiated',
                publicId,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            await cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            // Log successful deletion
            logger_1.logger.info('PDF deletion successful', {
                operation: 'pdf_deletion',
                status: 'success',
                publicId,
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // Log failed deletion with error details
            logger_1.logger.error('PDF deletion failed', {
                operation: 'pdf_deletion',
                status: 'failed',
                publicId,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorDetails: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                } : (0, upload_errors_1.safeSerialize)(error),
                ...(userInfo && {
                    userId: userInfo.userId,
                    userEmail: userInfo.email,
                }),
                timestamp: new Date().toISOString(),
            });
            throw new Error('Failed to delete PDF');
        }
    }
}
exports.UploadService = UploadService;
exports.uploadService = new UploadService();
//# sourceMappingURL=upload.service.js.map