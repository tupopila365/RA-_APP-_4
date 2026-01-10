import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class ProcurementLegislationController {
    /**
     * Create a new procurement legislation document
     * POST /api/procurement-legislation
     */
    createLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List procurement legislation with pagination, filtering, and search
     * GET /api/procurement-legislation
     */
    listLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single procurement legislation by ID
     * GET /api/procurement-legislation/:id
     */
    getLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update procurement legislation
     * PUT /api/procurement-legislation/:id
     */
    updateLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete procurement legislation
     * DELETE /api/procurement-legislation/:id
     */
    deleteLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk upload procurement legislation documents
     * POST /api/procurement-legislation/bulk-upload
     */
    bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const procurementLegislationController: ProcurementLegislationController;
//# sourceMappingURL=procurement-legislation.controller.d.ts.map