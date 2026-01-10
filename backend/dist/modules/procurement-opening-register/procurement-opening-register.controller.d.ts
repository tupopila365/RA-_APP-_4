import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class ProcurementOpeningRegisterController {
    /**
     * Create a new procurement opening register item
     * POST /api/procurement-opening-register
     */
    createItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List procurement opening register items with pagination, filtering, and search
     * GET /api/procurement-opening-register
     */
    listItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single procurement opening register item by ID
     * GET /api/procurement-opening-register/:id
     */
    getItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update procurement opening register item
     * PUT /api/procurement-opening-register/:id
     */
    updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete procurement opening register item
     * DELETE /api/procurement-opening-register/:id
     */
    deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk upload procurement opening register notices
     * POST /api/procurement-opening-register/bulk-upload
     */
    bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const procurementOpeningRegisterController: ProcurementOpeningRegisterController;
//# sourceMappingURL=procurement-opening-register.controller.d.ts.map