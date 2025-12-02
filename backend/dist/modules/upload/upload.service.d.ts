export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}
export interface PDFUploadResult {
    url: string;
    publicId: string;
    format: string;
    bytes: number;
    accessType?: 'public' | 'signed';
    expiresAt?: Date;
    googleDriveFileId?: string;
    googleDriveUrl?: string;
    ragDownloadUrl?: string;
}
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
export declare class UploadService {
    private readonly ALLOWED_IMAGE_FORMATS;
    private readonly MAX_IMAGE_SIZE;
    private readonly MAX_PDF_SIZE;
    private readonly UPLOAD_FOLDER;
    /**
     * Sanitize filename for Cloudinary upload
     * Removes spaces, special characters, and ensures URL-safe naming
     */
    private sanitizeFilename;
    /**
     * Validate image file
     */
    validateImage(file: Express.Multer.File): ValidationResult;
    /**
     * Validate PDF file
     */
    validatePDF(file: Express.Multer.File): ValidationResult;
    /**
     * Upload image to Cloudinary
     */
    uploadImage(file: Express.Multer.File): Promise<UploadResult>;
    /**
     * Validate PDF upload result contains all required metadata
     */
    private validatePDFUploadResult;
    /**
     * Upload PDF to Cloudinary
     */
    uploadPDF(file: Express.Multer.File, userInfo?: {
        userId: string;
        email: string;
    }): Promise<PDFUploadResult>;
    /**
     * Validate that an uploaded URL is accessible
     * @param url - The URL to validate
     * @param fileMetadata - File metadata for logging
     * @returns Promise<boolean> - true if URL is accessible, false otherwise
     */
    private validateUploadedURL;
    /**
     * Handle upload errors with proper categorization and logging
     */
    private handleUploadError;
    /**
     * Delete image from Cloudinary
     */
    deleteImage(publicId: string): Promise<void>;
    /**
     * Delete PDF from Cloudinary
     */
    deletePDF(publicId: string, userInfo?: {
        userId: string;
        email: string;
    }): Promise<void>;
}
export declare const uploadService: UploadService;
//# sourceMappingURL=upload.service.d.ts.map