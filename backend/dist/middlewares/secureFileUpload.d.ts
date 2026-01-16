import multer from 'multer';
import { Request } from 'express';
declare global {
    namespace Express {
        namespace Multer {
            interface File {
                securityValidated?: boolean;
                validationTimestamp?: string;
            }
        }
    }
}
/**
 * Secure file upload middleware with comprehensive validation
 */
export declare class SecureFileUpload {
    private static readonly ALLOWED_MIME_TYPES;
    private static readonly MAX_FILE_SIZE;
    private static readonly MAGIC_NUMBERS;
    /**
     * Validate file by magic number (file signature)
     */
    private static validateFileSignature;
    /**
     * Scan file for malware using antivirus service
     */
    private static scanFileForMalware;
    /**
     * Comprehensive file security validation
     */
    private static validateFileSecurely;
    /**
     * Validate PDF structure
     */
    private static validatePDFStructure;
    /**
     * Generate secure file name
     */
    private static generateSecureFileName;
    /**
     * Create secure multer configuration
     */
    static createSecureUpload(options: {
        allowedTypes: ('pdf' | 'image')[];
        destination: string;
        maxFileSize?: number;
    }): multer.Multer;
    /**
     * Post-upload validation middleware
     */
    static validateUploadedFile: (req: Request, res: any, next: any) => Promise<any>;
    /**
     * Create secure document upload middleware for PLN
     */
    static createPLNDocumentUpload(): multer.Multer;
}
//# sourceMappingURL=secureFileUpload.d.ts.map