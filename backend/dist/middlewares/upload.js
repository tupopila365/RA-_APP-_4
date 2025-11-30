"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadDocument = exports.uploadPDF = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
// Configure memory storage for Cloudinary upload
const storage = multer_1.default.memoryStorage();
// File filter for images
const imageFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        logger_1.logger.warn(`Invalid image file type attempted: ${file.originalname}`);
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};
// File filter for PDFs
const pdfFilter = (_req, file, cb) => {
    const extname = path_1.default.extname(file.originalname).toLowerCase() === '.pdf';
    const mimetype = file.mimetype === 'application/pdf';
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'));
    }
};
// File filter for images and PDFs
const documentFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image and PDF files are allowed'));
    }
};
// Image upload middleware (max 5MB)
exports.uploadImage = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});
// PDF upload middleware (max 10MB)
exports.uploadPDF = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: pdfFilter,
});
// Document upload middleware (max 10MB)
exports.uploadDocument = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: documentFilter,
});
/**
 * Multer error handler middleware
 * Handles file upload errors and provides user-friendly messages
 */
const handleUploadError = (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        logger_1.logger.error('Multer error:', err);
        // Handle specific multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                success: false,
                message: 'File size exceeds the maximum limit of 5MB',
            });
            return;
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({
                success: false,
                message: 'Unexpected field name in file upload',
            });
            return;
        }
        res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
        return;
    }
    if (err) {
        logger_1.logger.error('Upload error:', err);
        res.status(400).json({
            success: false,
            message: err.message || 'Error uploading file',
        });
        return;
    }
    next();
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map