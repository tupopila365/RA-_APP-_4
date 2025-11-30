/**
 * Upload error types for categorizing different failure scenarios
 */
export enum UploadErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CLOUDINARY_ERROR = 'CLOUDINARY_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
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
export function createUploadError(
  type: UploadErrorType,
  message: string,
  details?: any
): UploadError {
  const error = new Error(message) as UploadError;
  error.type = type;
  error.details = details;
  return error;
}

/**
 * Safely serialize an object, handling circular references
 */
export function safeSerialize(obj: any): any {
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
export function extractFileMetadata(file: Express.Multer.File): {
  fileName: string;
  fileSize: number;
  fileType: string;
} {
  return {
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype,
  };
}
