"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipleUploadError = exports.uploadMultiplePDFs = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
// Configure memory storage for Cloudinary upload
const storage = multer_1.default.memoryStorage();
// File filter for PDFs (for procurement documents)
const pdfFilter = (_req, file, cb) => {
    const extname = path_1.default.extname(file.originalname).toLowerCase() === '.pdf';
    const mimetype = file.mimetype === 'application/pdf';
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        logger_1.logger.warn(`Invalid PDF file type attempted: ${file.originalname}`);
        cb(new Error('Only PDF files are allowed'));
    }
};
// Multiple PDF upload middleware (max 10 files, 10MB each)
exports.uploadMultiplePDFs = (0, multer_1.default)({
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
const handleMultipleUploadError = (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        logger_1.logger.error('Multer error:', err);
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
        logger_1.logger.error('Upload error:', err);
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
exports.handleMultipleUploadError = handleMultipleUploadError;
//# sourceMappingURL=uploadMultiple.js.map