import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class UploadController {
    /**
     * Upload single image
     */
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload single PDF
     */
    uploadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete image
     */
    deleteImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete PDF
     */
    deletePDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const uploadController: UploadController;
//# sourceMappingURL=upload.controller.d.ts.map