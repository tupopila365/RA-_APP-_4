"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.generateSignedURL = exports.validateURLAccess = exports.isCloudinaryConfigured = exports.configureCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const configureCloudinary = () => {
    // Check if Cloudinary credentials are provided
    if (!env_1.env.CLOUDINARY_CLOUD_NAME || !env_1.env.CLOUDINARY_API_KEY || !env_1.env.CLOUDINARY_API_SECRET) {
        logger_1.logger.warn('Cloudinary credentials not provided. Image upload functionality will be disabled.');
        return;
    }
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
    logger_1.logger.info('Cloudinary configured successfully');
};
exports.configureCloudinary = configureCloudinary;
/**
 * Check if Cloudinary is configured
 */
const isCloudinaryConfigured = () => {
    return !!(env_1.env.CLOUDINARY_CLOUD_NAME && env_1.env.CLOUDINARY_API_KEY && env_1.env.CLOUDINARY_API_SECRET);
};
exports.isCloudinaryConfigured = isCloudinaryConfigured;
/**
 * Validate that a URL is accessible via HTTP HEAD request
 * @param url - The URL to validate
 * @returns Promise<boolean> - true if URL is accessible (returns 2xx status), false otherwise
 */
const validateURLAccess = async (url) => {
    try {
        logger_1.logger.info('Validating URL accessibility', { url });
        const response = await axios_1.default.head(url, {
            timeout: 5000, // 5 second timeout
            validateStatus: (status) => status >= 200 && status < 400, // Accept 2xx and 3xx
        });
        const isAccessible = response.status >= 200 && response.status < 400;
        logger_1.logger.info('URL validation result', {
            url,
            status: response.status,
            accessible: isAccessible,
        });
        return isAccessible;
    }
    catch (error) {
        // Log validation failure with details
        logger_1.logger.error('URL validation failed', {
            url,
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
        });
        return false;
    }
};
exports.validateURLAccess = validateURLAccess;
/**
 * Generate a signed URL for Cloudinary resources
 * @param publicId - The Cloudinary public ID of the resource
 * @param options - Optional configuration for the signed URL
 * @returns string - The signed URL with authentication parameters
 */
const generateSignedURL = (publicId, options) => {
    try {
        const resourceType = options?.resourceType ?? 'raw'; // Default to 'raw' for PDFs
        const deliveryType = options?.type ?? 'upload'; // Default to 'upload' for public files
        logger_1.logger.info('Generating signed URL', {
            publicId,
            resourceType,
            deliveryType,
            expiresIn: options?.expiresIn ?? 'never',
        });
        // Generate signed URL using Cloudinary SDK
        // The SDK handles signature generation automatically
        // For public files (type: 'upload'), the signature ensures URL integrity
        // but the file remains publicly accessible
        const signedUrl = cloudinary_1.v2.url(publicId, {
            resource_type: resourceType,
            type: deliveryType, // Use 'upload' for public files, 'authenticated' for private
            sign_url: true, // Enable URL signing - adds cryptographic signature
            secure: true, // Use HTTPS
            ...(options?.transformation && { transformation: options.transformation }),
        });
        logger_1.logger.info('Signed URL generated successfully', {
            publicId,
            resourceType,
            deliveryType,
            urlLength: signedUrl.length,
            hasSignature: signedUrl.includes('s--'),
        });
        return signedUrl;
    }
    catch (error) {
        logger_1.logger.error('Failed to generate signed URL', {
            publicId,
            error: error.message,
            stack: error.stack,
        });
        throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
};
exports.generateSignedURL = generateSignedURL;
//# sourceMappingURL=cloudinary.js.map