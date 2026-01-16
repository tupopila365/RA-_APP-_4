"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const secureIdGenerator_1 = require("../utils/secureIdGenerator");
const antivirusService_1 = require("../services/antivirusService");
const logger_1 = require("../utils/logger");
/**
 * Secure file upload middleware with comprehensive validation
 */
class SecureFileUpload {
    /**
     * Validate file by magic number (file signature)
     */
    static async validateFileSignature(filePath, expectedType) {
        try {
            const buffer = await promises_1.default.readFile(filePath);
            const magicNumbers = this.MAGIC_NUMBERS[expectedType];
            if (!magicNumbers)
                return false;
            for (let i = 0; i < magicNumbers.length; i++) {
                if (buffer[i] !== magicNumbers[i]) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error validating file signature:', error);
            return false;
        }
    }
    /**
     * Scan file for malware using antivirus service
     */
    static async scanFileForMalware(filePath) {
        try {
            const scanResult = await antivirusService_1.AntivirusService.scanFile(filePath);
            return scanResult.isClean;
        }
        catch (error) {
            logger_1.logger.error('Malware scan failed:', error);
            // Fail safe - if scan fails, consider file unsafe
            return false;
        }
    }
    /**
     * Comprehensive file security validation
     */
    static async validateFileSecurely(filePath, expectedType) {
        try {
            // 1. Validate file signature
            const hasValidSignature = await this.validateFileSignature(filePath, expectedType);
            if (!hasValidSignature) {
                return {
                    isValid: false,
                    error: 'Invalid file signature - file may be corrupted or not the expected type',
                };
            }
            // 2. Scan for malware
            const scanResult = await antivirusService_1.AntivirusService.scanFile(filePath);
            if (!scanResult.isClean) {
                return {
                    isValid: false,
                    error: `File contains threats: ${scanResult.threats.join(', ')}`,
                    scanResult,
                };
            }
            // 3. Additional PDF-specific validation
            if (expectedType === 'pdf') {
                const pdfValidation = await this.validatePDFStructure(filePath);
                if (!pdfValidation.isValid) {
                    return {
                        isValid: false,
                        error: pdfValidation.error,
                    };
                }
            }
            return {
                isValid: true,
                scanResult,
            };
        }
        catch (error) {
            logger_1.logger.error('File security validation failed:', error);
            return {
                isValid: false,
                error: 'File validation failed due to security check error',
            };
        }
    }
    /**
     * Validate PDF structure
     */
    static async validatePDFStructure(filePath) {
        try {
            const buffer = await promises_1.default.readFile(filePath);
            const content = buffer.toString('utf8');
            // Check for PDF structure
            if (!content.includes('%PDF-')) {
                return { isValid: false, error: 'Invalid PDF structure' };
            }
            // Check for suspicious JavaScript in PDF
            const suspiciousPatterns = [
                /\/JavaScript/i,
                /\/JS/i,
                /\/OpenAction/i,
                /\/Launch/i,
                /\/EmbeddedFile/i,
            ];
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(content)) {
                    return {
                        isValid: false,
                        error: 'PDF contains potentially dangerous content'
                    };
                }
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: 'Failed to validate PDF structure'
            };
        }
    }
    /**
     * Generate secure file name
     */
    static generateSecureFileName(originalName) {
        const ext = path_1.default.extname(originalName).toLowerCase();
        const secureId = secureIdGenerator_1.SecureIdGenerator.generateFileUploadToken();
        const timestamp = Date.now();
        return `${timestamp}_${secureId}${ext}`;
    }
    /**
     * Create secure multer configuration
     */
    static createSecureUpload(options) {
        const storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, options.destination);
            },
            filename: (req, file, cb) => {
                const secureFileName = this.generateSecureFileName(file.originalname);
                cb(null, secureFileName);
            },
        });
        const fileFilter = (req, file, cb) => {
            // Check file extension
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const allowedExts = options.allowedTypes.includes('pdf') ? ['.pdf'] : [];
            if (options.allowedTypes.includes('image')) {
                allowedExts.push('.jpg', '.jpeg', '.png');
            }
            if (!allowedExts.includes(ext)) {
                return cb(new Error(`Invalid file type. Allowed types: ${allowedExts.join(', ')}`));
            }
            // Check MIME type
            const allowedMimeTypes = options.allowedTypes.flatMap(type => this.ALLOWED_MIME_TYPES[type]);
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return cb(new Error(`Invalid MIME type. Expected: ${allowedMimeTypes.join(', ')}`));
            }
            cb(null, true);
        };
        const maxSize = options.maxFileSize || Math.max(...options.allowedTypes.map(type => this.MAX_FILE_SIZE[type]));
        return (0, multer_1.default)({
            storage,
            fileFilter,
            limits: {
                fileSize: maxSize,
                files: 1, // Only allow one file at a time
            },
        });
    }
    /**
     * Create secure document upload middleware for PLN
     */
    static createPLNDocumentUpload() {
        return this.createSecureUpload({
            allowedTypes: ['pdf', 'image'],
            destination: process.env.UPLOAD_DIR || './uploads/pln-documents',
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });
    }
}
exports.SecureFileUpload = SecureFileUpload;
_a = SecureFileUpload;
SecureFileUpload.ALLOWED_MIME_TYPES = {
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/jpg', 'image/png'],
};
SecureFileUpload.MAX_FILE_SIZE = {
    pdf: 10 * 1024 * 1024, // 10MB
    image: 5 * 1024 * 1024, // 5MB
};
SecureFileUpload.MAGIC_NUMBERS = {
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
};
/**
 * Post-upload validation middleware
 */
SecureFileUpload.validateUploadedFile = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        const filePath = req.file.path;
        const fileExt = path_1.default.extname(req.file.originalname).toLowerCase();
        // Validate file signature
        let expectedType;
        if (fileExt === '.pdf') {
            expectedType = 'pdf';
        }
        else if (['.jpg', '.jpeg'].includes(fileExt)) {
            expectedType = 'jpeg';
        }
        else if (fileExt === '.png') {
            expectedType = 'png';
        }
        else {
            await promises_1.default.unlink(filePath); // Delete invalid file
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_FILE_TYPE',
                    message: 'Invalid file type detected',
                },
                timestamp: new Date().toISOString(),
            });
        }
        const isValidSignature = await _a.validateFileSignature(filePath, expectedType);
        if (!isValidSignature) {
            await promises_1.default.unlink(filePath); // Delete invalid file
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_FILE_SIGNATURE',
                    message: 'File signature validation failed',
                },
                timestamp: new Date().toISOString(),
            });
        }
        // Scan for malware
        const isSafe = await _a.scanFileForMalware(filePath);
        if (!isSafe) {
            await promises_1.default.unlink(filePath); // Delete potentially malicious file
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MALICIOUS_FILE_DETECTED',
                    message: 'File failed security scan',
                },
                timestamp: new Date().toISOString(),
            });
        }
        // Add security metadata to request
        req.file.securityValidated = true;
        req.file.validationTimestamp = new Date().toISOString();
        next();
    }
    catch (error) {
        console.error('File validation error:', error);
        // Clean up file on error
        if (req.file && req.file.path) {
            try {
                await promises_1.default.unlink(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'FILE_VALIDATION_ERROR',
                message: 'File validation failed',
            },
            timestamp: new Date().toISOString(),
        });
    }
};
//# sourceMappingURL=secureFileUpload.js.map