"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadErrorType = void 0;
exports.createUploadError = createUploadError;
exports.safeSerialize = safeSerialize;
exports.extractFileMetadata = extractFileMetadata;
/**
 * Upload error types for categorizing different failure scenarios
 */
var UploadErrorType;
(function (UploadErrorType) {
    UploadErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    UploadErrorType["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    UploadErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    UploadErrorType["CLOUDINARY_ERROR"] = "CLOUDINARY_ERROR";
    UploadErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    UploadErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(UploadErrorType || (exports.UploadErrorType = UploadErrorType = {}));
/**
 * Create a typed upload error with metadata
 */
function createUploadError(type, message, details) {
    const error = new Error(message);
    error.type = type;
    error.details = details;
    return error;
}
/**
 * Safely serialize an object, handling circular references
 */
function safeSerialize(obj) {
    // Handle undefined, null, and primitive values
    if (obj === undefined) {
        return undefined;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    const seen = new WeakSet();
    const stringified = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
    return JSON.parse(stringified);
}
/**
 * Extract metadata from a file for error logging
 */
function extractFileMetadata(file) {
    return {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
    };
}
//# sourceMappingURL=upload.errors.js.map