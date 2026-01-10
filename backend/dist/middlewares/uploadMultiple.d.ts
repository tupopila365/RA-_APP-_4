import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const uploadMultiplePDFs: multer.Multer;
/**
 * Multer error handler middleware for multiple file uploads
 * Handles file upload errors and provides user-friendly messages
 */
export declare const handleMultipleUploadError: (err: any, _req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=uploadMultiple.d.ts.map