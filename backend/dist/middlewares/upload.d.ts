import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const uploadImage: multer.Multer;
export declare const uploadPDF: multer.Multer;
export declare const uploadDocument: multer.Multer;
/**
 * Multer error handler middleware
 * Handles file upload errors and provides user-friendly messages
 */
export declare const handleUploadError: (err: any, _req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.d.ts.map