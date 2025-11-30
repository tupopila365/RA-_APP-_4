import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ERROR_CODES } from '../constants/errors';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    logger.warn('Headers already sent, skipping error handler');
    return;
  }

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    name: err.name,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || ERROR_CODES.SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Invalid ID format';
    details = 'The provided ID is not a valid MongoDB ObjectId';
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    errorCode = ERROR_CODES.DUPLICATE_ERROR;
    message = 'Duplicate entry';
  }

  if (err.message && err.message.includes('Multer')) {
    statusCode = 400;
    errorCode = ERROR_CODES.UPLOAD_ERROR;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.AUTH_INVALID_TOKEN;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.AUTH_TOKEN_EXPIRED;
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
  } catch (sendError) {
    logger.error('Failed to send error response:', sendError);
  }
};

// Not found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.originalUrl} not found`,
    },
    timestamp: new Date().toISOString(),
  });
};
