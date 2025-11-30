import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class TendersController {
    /**
     * Create a new tender
     * POST /api/tenders
     */
    createTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all tenders with pagination, filtering, and search
     * GET /api/tenders
     */
    listTenders(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single tender by ID
     * GET /api/tenders/:id
     */
    getTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a tender
     * PUT /api/tenders/:id
     */
    updateTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a tender
     * DELETE /api/tenders/:id
     */
    deleteTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const tendersController: TendersController;
//# sourceMappingURL=tenders.controller.d.ts.map