import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { AppAuthRequest } from '../../middlewares/appAuth';
export declare class PLNController {
    /**
     * Create a new PLN application
     * POST /api/pln/applications
     */
    createApplication(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's PLN applications by email (if authenticated)
     * GET /api/pln/my-applications
     */
    getMyApplications(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Track application by reference ID and PIN (public)
     * GET /api/pln/track/:referenceId/:pin
     * Universal PIN: 12345 for all users
     */
    trackApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all applications (admin)
     * GET /api/pln/applications
     */
    listApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get application by ID (admin)
     * GET /api/pln/applications/:id
     */
    getApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update application status (admin)
     * PUT /api/pln/applications/:id/status
     */
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark payment as received (admin)
     * PUT /api/pln/applications/:id/payment
     */
    markPaymentReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Order plates (admin)
     * PUT /api/pln/applications/:id/order-plates
     */
    orderPlates(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark ready for collection (admin)
     * PUT /api/pln/applications/:id/ready
     */
    markReadyForCollection(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get dashboard statistics (admin)
     * GET /api/pln/dashboard/stats
     */
    getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Download application form as PDF (admin)
     * GET /api/pln/applications/:id/download-pdf
     * This fills the actual PLN-FORM.pdf template with the user's application data
     */
    downloadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update admin comments (admin)
     * PUT /api/pln/applications/:id/comments
     */
    updateAdminComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Assign application to admin (admin)
     * PUT /api/pln/applications/:id/assign
     */
    assignToAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Set application priority (admin)
     * PUT /api/pln/applications/:id/priority
     */
    setPriority(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    downloadForm(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const plnController: PLNController;
//# sourceMappingURL=pln.controller.d.ts.map