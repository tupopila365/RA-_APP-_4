import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class DocumentsController {
    /**
     * Upload a new document
     * POST /api/documents
     */
    uploadDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all documents with pagination and filtering
     * GET /api/documents
     */
    listDocuments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single document by ID
     * GET /api/documents/:id
     */
    getDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a document
     * DELETE /api/documents/:id
     */
    deleteDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const documentsController: DocumentsController;
//# sourceMappingURL=documents.controller.d.ts.map