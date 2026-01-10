import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class ProcurementPlanController {
    /**
     * Create a new procurement plan
     * POST /api/procurement-plan
     */
    createPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List procurement plans with pagination, filtering, and search
     * GET /api/procurement-plan
     */
    listPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single procurement plan by ID
     * GET /api/procurement-plan/:id
     */
    getPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update procurement plan
     * PUT /api/procurement-plan/:id
     */
    updatePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete procurement plan
     * DELETE /api/procurement-plan/:id
     */
    deletePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk upload procurement plans
     * POST /api/procurement-plan/bulk-upload
     */
    bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const procurementPlanController: ProcurementPlanController;
//# sourceMappingURL=procurement-plan.controller.d.ts.map