"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("../../config/cloudinary");
const google_drive_1 = require("../../config/google-drive");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
const upload_errors_1 = require("./upload.errors");
class UploadService {
    constructor() {
        this.ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        this.MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
        this.UPLOAD_FOLDER = 'roads-authority';
    }
    /**
     * Sanitize filename for Cloudinary upload
     * Removes spaces, special characters, and ensures URL-safe naming
     */
    sanitizeFilename(filename) {
        // Remove file extension
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        // Replace spaces with underscores and remove special characters
        // Keep only alphanumeric, underscores, and hyphens
        const sanitized = nameWithoutExt
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special characters
            .replace(/_+/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        return sanitized || 'document'; // Fallback if sanitization results in empty string
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
            // Determine access mode from environment configuration
            const accessMode = env_1.env.CLOUDINARY_PDF_ACCESS_MODE || 'public';
            const useSignedUrls = accessMode === 'signed';
            // Sanitize filename to prevent URL encoding issues
            const sanitizedFilename = this.sanitizeFilename(file.originalname);
            const timestamp = Date.now();
            const publicId = `doc_${timestamp}_${sanitizedFilename}`;
            // Upload to Cloudinary
            // Use 'raw' resource type for PDFs - Cloudinary will auto-detect the format
            // For public mode: Use 'upload' type to make PDFs publicly accessible (fixes 401 errors in RAG service)
            // For signed mode: Use 'authenticated' type to require signed URLs
            const uploadOptions = {
                folder: `${this.UPLOAD_FOLDER}/pdfs`,
                public_id: publicId, // Use sanitized filename without spaces
                resource_type: 'raw', // Use 'raw' for PDFs
                type: useSignedUrls ? 'authenticated' : 'upload', // 'authenticated' for signed URLs, 'upload' for public access
                access_mode: 'public', // CRITICAL: Explicitly set access_mode to 'public' to ensure PDFs are publicly accessible
            };
            logger_1.logger.info('Uploading PDF with access mode', {
                operation: 'pdf_upload',
                accessMode,
                uploadType: uploadOptions.type,
                accessModeExplicit: uploadOptions.access_mode,
                ...fileMetadata,
            });
            const result = await cloudinary_1.cloudinary.uploader.upload(dataURI, uploadOptions);
            // Validate response contains all required metadata
            const validatedResult = this.validatePDFUploadResult(result, file);
            // ALWAYS generate signed URL for PDFs to ensure secure access
            // For public files (type: 'upload'), the signature provides URL integrity
            // For private files (type: 'authenticated'), the signature provides access control
            const finalUrl = (0, cloudinary_1.generateSignedURL)(result.public_id, {
                resourceType: 'raw',
                type: useSignedUrls ? 'authenticated' : 'upload', // Match the upload type
            });
            logger_1.logger.info('Generated signed URL for PDF', {
                operation: 'pdf_upload',
                publicId: result.public_id,
                accessMode,
                deliveryType: useSignedUrls ? 'authenticated' : 'upload',
                originalUrl: validatedResult.url,
                signedUrl: finalUrl,
                ...fileMetadata,
            });
            // Note: Signed URLs for 'upload' type don't expire by default
            // Only 'authenticated' type URLs can have expiration
            let expiresAt;
            // Upload to Google Drive for RAG service (if configured)
            let googleDriveFileId;
            let googleDriveUrl;
            let ragDownloadUrl = finalUrl; // Default to Cloudinary URL
            if ((0, google_drive_1.isGoogleDriveConfigured)()) {
                try {
                    logger_1.logger.info('Uploading PDF to Google Drive for RAG service', {
                        operation: 'google_drive_upload',
                        ...fileMetadata,
                    });
                    const googleDriveResult = await (0, google_drive_1.uploadToGoogleDrive)(file.buffer, sanitizedFilename + '.pdf', 'application/pdf', env_1.env.GOOGLE_DRIVE_FOLDER_ID);
                    googleDriveFileId = googleDriveResult.fileId;
                    googleDriveUrl = googleDriveResult.webViewLink;
                    ragDownloadUrl = googleDriveResult.directDownloadLink; // Use Google Drive for RAG
                    logger_1.logger.info('PDF uploaded to Google Drive successfully', {
                        operation: 'google_drive_upload',
                        fileId: googleDriveFileId,
                        directDownloadLink: ragDownloadUrl,
                        ...fileMetadata,
                    });
                }
                catch (error) {
                    // Log error but don't fail the upload - Cloudinary URL can still be used
                    logger_1.logger.warn('Failed to upload to Google Drive, will use Cloudinary URL for RAG', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        ...fileMetadata,
                    });
                }
            }
            // Validate URL accessibility (use RAG download URL)
            const isAccessible = await this.validateUploadedURL(ragDownloadUrl, fileMetadata);
            if (!isAccessible) {
                throw (0, upload_errors_1.createUploadError)(upload_errors_1.UploadErrorType.CLOUDINARY_ERROR, 'Uploaded PDF URL is not accessible. The file was uploaded but cannot be downloaded.', { ...fileMetadata, url: ragDownloadUrl, accessMode });
            }
            // Log successful upload with Cloudinary response
            logger_1.logger.info('PDF upload successful', {
                operation: 'pdf_upload',
                status: 'success',
                ...fileMetadata,
                publicId: validatedResult.publicId,
                url: finalUrl,
                bytes: validatedResult.bytes,
                format: validatedResult.format,
                accessMode,
                urlAccessible: isAccessible,
                ...(expiresAt && { expiresAt: expiresAt.toISOString() }),
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
            return {
                ...validatedResult,
                url: finalUrl, // Cloudinary URL for display
                accessType: accessMode,
                ...(expiresAt && { expiresAt }),
                ...(googleDriveFileId && { googleDriveFileId }),
                ...(googleDriveUrl && { googleDriveUrl }),
                ragDownloadUrl, // Optimized URL for RAG service (Google Drive if available, otherwise Cloudinary)
            };
        }
        catch (error) {
            return this.handleUploadError(error, file, userInfo);
        }
    }
    /**
     * Validate that an uploaded URL is accessible
     * @param url - The URL to validate
     * @param fileMetadata - File metadata for logging
     * @returns Promise<boolean> - true if URL is accessible, false otherwise
     */
    async validateUploadedURL(url, fileMetadata) {
        try {
            logger_1.logger.info('Validating uploaded PDF URL accessibility', {
                operation: 'url_validation',
                url,
                ...fileMetadata,
                timestamp: new Date().toISOString(),
            });
            const isAccessible = await (0, cloudinary_1.validateURLAccess)(url);
            if (isAccessible) {
                logger_1.logger.info('URL validation successful', {
                    operation: 'url_validation',
                    status: 'success',
                    url,
                    ...fileMetadata,
                    timestamp: new Date().toISOString(),
                });
            }
            else {
                logger_1.logger.error('URL validation failed - URL not accessible', {
                    operation: 'url_validation',
                    status: 'failed',
                    url,
                    ...fileMetadata,
                    timestamp: new Date().toISOString(),
                });
            }
            return isAccessible;
        }
        catch (error) {
            logger_1.logger.error('URL validation error', {
                operation: 'url_validation',
                status: 'error',
                url,
                error: error instanceof Error ? error.message : 'Unknown error',
                ...fileMetadata,
                timestamp: new Date().toISOString(),
            });
            return false;
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