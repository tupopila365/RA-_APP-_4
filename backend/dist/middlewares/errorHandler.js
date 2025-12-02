"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../constants/errors");
const errorHandler = (err, req, res, _next) => {
    // Prevent sending response if headers already sent
    if (res.headersSent) {
        logger_1.logger.warn('Headers already sent, skipping error handler');
        return;
    }
    // Log error
    logger_1.logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        name: err.name,
    });
    // Default error values
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || errors_1.ERROR_CODES.SERVER_ERROR;
    let message = err.message || 'Internal server error';
    let details = err.details;
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = errors_1.ERROR_CODES.VALIDATION_ERROR;
        message = 'Validation error';
    }
    if (err.name === 'CastError') {
        statusCode = 400;
        errorCode = errors_1.ERROR_CODES.VALIDATION_ERROR;
        message = 'Invalid ID format';
        details = 'The provided ID is not a valid MongoDB ObjectId';
    }
    if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        errorCode = errors_1.ERROR_CODES.DUPLICATE_ERROR;
        message = 'Duplicate entry';
    }
    if (err.message && err.message.includes('Multer')) {
        statusCode = 400;
        errorCode = errors_1.ERROR_CODES.UPLOAD_ERROR;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = errors_1.ERROR_CODES.AUTH_INVALID_TOKEN;
        message = 'Invalid authentication token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = errors_1.ERROR_CODES.AUTH_TOKEN_EXPIRED;
        message = 'Authentication token expired';
    }
    // Send error response
    try {
        res.status(statusCode).json({
            success: false,
            error: {
                code: errorCode,
                message,
                details,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (sendError) {
        logger_1.logger.error('Failed to send error response:', sendError);
    }
};
exports.errorHandler = errorHandler;
// Not found handler
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        error: {
            code: errors_1.ERROR_CODES.NOT_FOUND,
            message: `Route ${req.originalUrl} not found`,
        },
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map