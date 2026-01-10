import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class ProcurementAwardController {
    /**
     * Create a new procurement award
     * POST /api/procurement-awards
     */
    createAward(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List procurement awards with pagination, filtering, and search
     * GET /api/procurement-awards
     */
    listAwards(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single procurement award by ID
     * GET /api/procurement-awards/:id
     */
    getAward(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update procurement award
     * PUT /api/procurement-awards/:id
     */
    updateAward(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete procurement award
     * DELETE /api/procurement-awards/:id
     */
    deleteAward(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk upload executive summary documents for procurement awards
     * POST /api/procurement-awards/bulk-upload
     * Note: This uploads only the executive summary documents. The award records must be created separately.
     */
    bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const procurementAwardController: ProcurementAwardController;
//# sourceMappingURL=procurement-awards.controller.d.ts.map