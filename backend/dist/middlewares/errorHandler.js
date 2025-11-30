"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../constants/errors");
const errorHandler = (err, req, res, _next) => {
    // Log error
    logger_1.logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });
    // Default error values
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || errors_1.ERROR_CODES.SERVER_ERROR;
    let message = err.message || 'Internal server error';
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
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            details: err.details,
        },
        timestamp: new Date().toISOString(),
    });
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