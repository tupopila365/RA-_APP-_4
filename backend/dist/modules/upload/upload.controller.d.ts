import { Request, Response, NextFunction } from 'express';
export declare class UploadController {
    /**
     * Upload single image
     */
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete image
     */
    deleteImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const uploadController: UploadController;
//# sourceMappingURL=upload.controller.d.ts.map