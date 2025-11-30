"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.isCloudinaryConfigured = exports.configureCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
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
//# sourceMappingURL=cloudinary.js.map