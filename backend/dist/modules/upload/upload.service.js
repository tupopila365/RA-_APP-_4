"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("../../config/cloudinary");
const logger_1 = require("../../utils/logger");
class UploadService {
    constructor() {
        this.ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }
        // Check file type
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !this.ALLOWED_FORMATS.includes(fileExtension)) {
            return {
                valid: false,
                error: `Invalid file format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`,
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
}
exports.UploadService = UploadService;
exports.uploadService = new UploadService();
//# sourceMappingURL=upload.service.js.map