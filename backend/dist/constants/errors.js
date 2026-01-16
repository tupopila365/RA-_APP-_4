"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.ERROR_CODES = void 0;
exports.ERROR_CODES = {
    // Authentication errors (AUTH_xxx)
    AUTH_INVALID_CREDENTIALS: 'AUTH_001',
    AUTH_TOKEN_EXPIRED: 'AUTH_002',
    AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_003',
    AUTH_INVALID_TOKEN: 'AUTH_004',
    AUTH_MISSING_TOKEN: 'AUTH_005',
    AUTH_UNAUTHORIZED: 'AUTH_006',
    AUTH_REQUIRED: 'AUTH_007',
    // Captcha errors (CAPTCHA_xxx)
    CAPTCHA_REQUIRED: 'CAPTCHA_001',
    CAPTCHA_INVALID: 'CAPTCHA_002',
    // Validation errors (VALIDATION_xxx)
    VALIDATION_ERROR: 'VALIDATION_001',
    VALIDATION_INVALID_INPUT: 'VALIDATION_002',
    // Upload errors (UPLOAD_xxx)
    UPLOAD_FAILED: 'UPLOAD_001',
    UPLOAD_INVALID_FILE_TYPE: 'UPLOAD_002',
    UPLOAD_FILE_TOO_LARGE: 'UPLOAD_003',
    UPLOAD_ERROR: 'UPLOAD_004',
    // Database errors (DB_xxx)
    DB_OPERATION_FAILED: 'DB_001',
    DB_CONNECTION_ERROR: 'DB_002',
    DUPLICATE_ERROR: 'DB_003',
    // RAG Service errors (RAG_xxx)
    RAG_SERVICE_UNAVAILABLE: 'RAG_001',
    RAG_INDEXING_FAILED: 'RAG_002',
    RAG_QUERY_FAILED: 'RAG_003',
    // Traffic service errors (TRAFFIC_xxx)
    TRAFFIC_CONFIG_MISSING: 'TRAFFIC_001',
    TRAFFIC_DATA_UNAVAILABLE: 'TRAFFIC_002',
    TRAFFIC_UPSTREAM_ERROR: 'TRAFFIC_003',
    // General errors
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
};
exports.ERROR_MESSAGES = {
    [exports.ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
    [exports.ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Token has expired',
    [exports.ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
    [exports.ERROR_CODES.AUTH_INVALID_TOKEN]: 'Invalid authentication token',
    [exports.ERROR_CODES.AUTH_MISSING_TOKEN]: 'Authentication token is required',
    [exports.ERROR_CODES.AUTH_UNAUTHORIZED]: 'Authentication is required',
    [exports.ERROR_CODES.AUTH_REQUIRED]: 'Authentication is required',
    [exports.ERROR_CODES.CAPTCHA_REQUIRED]: 'Captcha verification is required',
    [exports.ERROR_CODES.CAPTCHA_INVALID]: 'Invalid captcha response',
    [exports.ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
    [exports.ERROR_CODES.VALIDATION_INVALID_INPUT]: 'Invalid input data',
    [exports.ERROR_CODES.UPLOAD_FAILED]: 'File upload failed',
    [exports.ERROR_CODES.UPLOAD_INVALID_FILE_TYPE]: 'Invalid file type',
    [exports.ERROR_CODES.UPLOAD_FILE_TOO_LARGE]: 'File size exceeds limit',
    [exports.ERROR_CODES.UPLOAD_ERROR]: 'Error uploading file',
    [exports.ERROR_CODES.DB_OPERATION_FAILED]: 'Database operation failed',
    [exports.ERROR_CODES.DB_CONNECTION_ERROR]: 'Database connection error',
    [exports.ERROR_CODES.DUPLICATE_ERROR]: 'Resource already exists',
    [exports.ERROR_CODES.RAG_SERVICE_UNAVAILABLE]: 'RAG service is unavailable',
    [exports.ERROR_CODES.RAG_INDEXING_FAILED]: 'Document indexing failed',
    [exports.ERROR_CODES.RAG_QUERY_FAILED]: 'Query processing failed',
    [exports.ERROR_CODES.TRAFFIC_CONFIG_MISSING]: 'Traffic data provider not configured',
    [exports.ERROR_CODES.TRAFFIC_DATA_UNAVAILABLE]: 'Traffic data unavailable for the requested location',
    [exports.ERROR_CODES.TRAFFIC_UPSTREAM_ERROR]: 'Failed to retrieve traffic data from provider',
    [exports.ERROR_CODES.NOT_FOUND]: 'Resource not found',
    [exports.ERROR_CODES.SERVER_ERROR]: 'Internal server error',
    [exports.ERROR_CODES.BAD_REQUEST]: 'Bad request',
};
//# sourceMappingURL=errors.js.map