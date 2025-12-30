import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class FAQsController {
    /**
     * Create a new FAQ
     * POST /api/faqs
     */
    createFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all FAQs with pagination, filtering, and search
     * GET /api/faqs
     */
    listFAQs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single FAQ by ID
     * GET /api/faqs/:id
     */
    getFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a FAQ
     * PUT /api/faqs/:id
     */
    updateFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a FAQ
     * DELETE /api/faqs/:id
     */
    deleteFAQ(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const faqsController: FAQsController;
//# sourceMappingURL=faqs.controller.d.ts.map