/**
 * Upload error types for categorizing different failure scenarios
 */
export declare enum UploadErrorType {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    CLOUDINARY_ERROR = "CLOUDINARY_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * Custom error interface for upload operations
 * Extends Error with type and details fields for better diagnostics
 */
export interface UploadError extends Error {
    type: UploadErrorType;
    details?: {
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        cloudinaryError?: any;
        originalError?: any;
    };
}
/**
 * Create a typed upload error with metadata
 */
export declare function createUploadError(type: UploadErrorType, message: string, details?: any): UploadError;
/**
 * Safely serialize an object, handling circular references
 */
export declare function safeSerialize(obj: any): any;
/**
 * Extract metadata from a file for error logging
 */
export declare function extractFileMetadata(file: Express.Multer.File): {
    fileName: string;
    fileSize: number;
    fileType: string;
};
//# sourceMappingURL=upload.errors.d.ts.map