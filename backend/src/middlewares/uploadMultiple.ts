import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Configure memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter for PDFs (for procurement documents)
const pdfFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const extname = path.extname(file.originalname).toLowerCase() === '.pdf';
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    logger.warn(`Invalid PDF file type attempted: ${file.originalname}`);
    cb(new Error('Only PDF files are allowed'));
  }
};

// Multiple PDF upload middleware (max 10 files, 10MB each)
export const uploadMultiplePDFs = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: pdfFilter,
});

/**
 * Multer error handler middleware for multiple file uploads
 * Handles file upload errors and provides user-friendly messages
 */
export const handleMultipleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error:', err);

    // Handle specific multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File size exceeds the maximum limit of 10MB per file',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Maximum of 10 files allowed per upload',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Unexpected field name in file upload',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Upload error: ${err.message}`,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err) {
    logger.error('Upload error:', err);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Error uploading files',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

