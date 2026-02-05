import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class FormController {
    /**
     * Create a new form
     * POST /api/forms
     */
    createForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List forms with pagination, filtering, and search
     * GET /api/forms
     */
    listForms(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single form by ID
     * GET /api/forms/:id
     */
    getForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update form
     * PUT /api/forms/:id
     */
    updateForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete form
     * DELETE /api/forms/:id
     */
    deleteForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const formController: FormController;
//# sourceMappingURL=forms.controller.d.ts.map