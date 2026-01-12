import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import { SecureIdGenerator } from '../utils/secureIdGenerator';
import { AntivirusService } from '../services/antivirusService';
import { logger } from '../utils/logger';

/**
 * Secure file upload middleware with comprehensive validation
 */
export class SecureFileUpload {
  private static readonly ALLOWED_MIME_TYPES = {
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/jpg', 'image/png'],
  };

  private static readonly MAX_FILE_SIZE = {
    pdf: 10 * 1024 * 1024, // 10MB
    image: 5 * 1024 * 1024, // 5MB
  };

  private static readonly MAGIC_NUMBERS = {
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  };

  /**
   * Validate file by magic number (file signature)
   */
  private static async validateFileSignature(filePath: string, expectedType: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      const magicNumbers = this.MAGIC_NUMBERS[expectedType as keyof typeof this.MAGIC_NUMBERS];
      
      if (!magicNumbers) return false;
      
      for (let i = 0; i < magicNumbers.length; i++) {
        if (buffer[i] !== magicNumbers[i]) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating file signature:', error);
      return false;
    }
  }

  /**
   * Comprehensive file security validation
   */
  private static async validateFileSecurely(filePath: string, expectedType: string): Promise<{
    isValid: boolean;
    error?: string;
    scanResult?: any;
  }> {
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
      const scanResult = await AntivirusService.scanFile(filePath);
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
    } catch (error) {
      logger.error('File security validation failed:', error);
      return {
        isValid: false,
        error: 'File validation failed due to security check error',
      };
    }
  }

  /**
   * Validate PDF structure
   */
  private static async validatePDFStructure(filePath: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const buffer = await fs.readFile(filePath);
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
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Failed to validate PDF structure' 
      };
    }
  }

  /**
   * Generate secure file name
   */
  private static generateSecureFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const secureId = SecureIdGenerator.generateFileUploadToken();
    const timestamp = Date.now();
    
    return `${timestamp}_${secureId}${ext}`;
  }

  /**
   * Create secure multer configuration
   */
  static createSecureUpload(options: {
    allowedTypes: ('pdf' | 'image')[];
    destination: string;
    maxFileSize?: number;
  }) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, options.destination);
      },
      filename: (req, file, cb) => {
        const secureFileName = this.generateSecureFileName(file.originalname);
        cb(null, secureFileName);
      },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Check file extension
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExts = options.allowedTypes.includes('pdf') ? ['.pdf'] : [];
      if (options.allowedTypes.includes('image')) {
        allowedExts.push('.jpg', '.jpeg', '.png');
      }

      if (!allowedExts.includes(ext)) {
        return cb(new Error(`Invalid file type. Allowed types: ${allowedExts.join(', ')}`));
      }

      // Check MIME type
      const allowedMimeTypes = options.allowedTypes.flatMap(type => 
        this.ALLOWED_MIME_TYPES[type]
      );

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid MIME type. Expected: ${allowedMimeTypes.join(', ')}`));
      }

      cb(null, true);
    };

    const maxSize = options.maxFileSize || Math.max(
      ...options.allowedTypes.map(type => this.MAX_FILE_SIZE[type])
    );

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: maxSize,
        files: 1, // Only allow one file at a time
      },
    });
  }

  /**
   * Post-upload validation middleware
   */
  static validateUploadedFile = async (req: Request, res: any, next: any) => {
    if (!req.file) {
      return next();
    }

    try {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      // Validate file signature
      let expectedType: string;
      if (fileExt === '.pdf') {
        expectedType = 'pdf';
      } else if (['.jpg', '.jpeg'].includes(fileExt)) {
        expectedType = 'jpeg';
      } else if (fileExt === '.png') {
        expectedType = 'png';
      } else {
        await fs.unlink(filePath); // Delete invalid file
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Invalid file type detected',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const isValidSignature = await this.validateFileSignature(filePath, expectedType);
      if (!isValidSignature) {
        await fs.unlink(filePath); // Delete invalid file
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
      const isSafe = await this.scanFileForMalware(filePath);
      if (!isSafe) {
        await fs.unlink(filePath); // Delete potentially malicious file
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
    } catch (error) {
      console.error('File validation error:', error);
      
      // Clean up file on error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
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