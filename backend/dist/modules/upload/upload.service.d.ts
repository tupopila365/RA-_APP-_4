export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
export declare class UploadService {
    private readonly ALLOWED_FORMATS;
    private readonly MAX_FILE_SIZE;
    private readonly UPLOAD_FOLDER;
    /**
     * Validate image file
     */
    validateImage(file: Express.Multer.File): ValidationResult;
    /**
     * Upload image to Cloudinary
     */
    uploadImage(file: Express.Multer.File): Promise<UploadResult>;
    /**
     * Delete image from Cloudinary
     */
    deleteImage(publicId: string): Promise<void>;
}
export declare const uploadService: UploadService;
//# sourceMappingURL=upload.service.d.ts.map