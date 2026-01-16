import { Request, Response, NextFunction } from 'express';
/**
 * Comprehensive input sanitization middleware
 */
export declare class InputSanitizer {
    /**
     * Sanitize string input to prevent XSS
     */
    static sanitizeString(input: string): string;
    /**
     * Validate and sanitize ID numbers
     */
    static sanitizeIdNumber(idNumber: string): string;
    /**
     * Validate and sanitize phone numbers
     */
    static sanitizePhoneNumber(phone: string): string;
    /**
     * Validate email addresses
     */
    static sanitizeEmail(email: string): string;
    /**
     * Sanitize file names
     */
    static sanitizeFileName(fileName: string): string;
    /**
     * Middleware to sanitize PLN application data
     */
    static sanitizePLNData: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=inputSanitization.d.ts.map