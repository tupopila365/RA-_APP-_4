import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Comprehensive input sanitization middleware
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove HTML tags and sanitize
    const sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    // Additional validation
    return validator.escape(sanitized.trim());
  }

  /**
   * Validate and sanitize ID numbers
   */
  static sanitizeIdNumber(idNumber: string): string {
    if (!idNumber) return '';
    
    // Remove all non-alphanumeric characters
    const cleaned = idNumber.replace(/[^a-zA-Z0-9]/g, '');
    
    // Validate length (adjust based on your ID format)
    if (cleaned.length < 5 || cleaned.length > 20) {
      throw new Error('Invalid ID number format');
    }
    
    return cleaned.toUpperCase();
  }

  /**
   * Validate and sanitize phone numbers
   */
  static sanitizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Validate phone number format
    if (!validator.isMobilePhone(cleaned, 'any', { strictMode: false })) {
      throw new Error('Invalid phone number format');
    }
    
    return cleaned;
  }

  /**
   * Validate email addresses
   */
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    const cleaned = email.trim().toLowerCase();
    
    if (!validator.isEmail(cleaned)) {
      throw new Error('Invalid email format');
    }
    
    return cleaned;
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    // Remove path traversal attempts and dangerous characters
    const sanitized = fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+/, '')
      .trim();
    
    if (sanitized.length === 0) {
      return 'document';
    }
    
    return sanitized;
  }

  /**
   * Middleware to sanitize PLN application data
   */
  static sanitizePLNData = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.body) {
        // Sanitize text fields
        if (req.body.fullName) {
          req.body.fullName = InputSanitizer.sanitizeString(req.body.fullName);
        }
        if (req.body.surname) {
          req.body.surname = InputSanitizer.sanitizeString(req.body.surname);
        }
        if (req.body.initials) {
          req.body.initials = InputSanitizer.sanitizeString(req.body.initials);
        }
        if (req.body.businessName) {
          req.body.businessName = InputSanitizer.sanitizeString(req.body.businessName);
        }

        // Sanitize ID numbers
        if (req.body.idNumber) {
          req.body.idNumber = InputSanitizer.sanitizeIdNumber(req.body.idNumber);
        }
        if (req.body.trafficRegisterNumber) {
          req.body.trafficRegisterNumber = InputSanitizer.sanitizeIdNumber(req.body.trafficRegisterNumber);
        }
        if (req.body.businessRegNumber) {
          req.body.businessRegNumber = InputSanitizer.sanitizeIdNumber(req.body.businessRegNumber);
        }

        // Sanitize contact information
        if (req.body.phoneNumber) {
          req.body.phoneNumber = InputSanitizer.sanitizePhoneNumber(req.body.phoneNumber);
        }
        if (req.body.cellNumber) {
          req.body.cellNumber = InputSanitizer.sanitizePhoneNumber(req.body.cellNumber);
        }
        if (req.body.email) {
          req.body.email = InputSanitizer.sanitizeEmail(req.body.email);
        }

        // Sanitize address fields
        if (req.body.postalAddress) {
          const postal = typeof req.body.postalAddress === 'string' 
            ? JSON.parse(req.body.postalAddress) 
            : req.body.postalAddress;
          
          if (postal.line1) postal.line1 = InputSanitizer.sanitizeString(postal.line1);
          if (postal.line2) postal.line2 = InputSanitizer.sanitizeString(postal.line2);
          if (postal.city) postal.city = InputSanitizer.sanitizeString(postal.city);
          if (postal.postalCode) postal.postalCode = InputSanitizer.sanitizeString(postal.postalCode);
          
          req.body.postalAddress = postal;
        }

        // Sanitize plate choices
        if (req.body.plateChoices) {
          const choices = typeof req.body.plateChoices === 'string' 
            ? JSON.parse(req.body.plateChoices) 
            : req.body.plateChoices;
          
          if (Array.isArray(choices)) {
            req.body.plateChoices = choices.map(choice => ({
              text: InputSanitizer.sanitizeString(choice.text || ''),
              meaning: InputSanitizer.sanitizeString(choice.meaning || '')
            }));
          }
        }
      }

      // Sanitize file name if present
      if (req.file && req.file.originalname) {
        req.file.originalname = InputSanitizer.sanitizeFileName(req.file.originalname);
      }

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Invalid input data',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}