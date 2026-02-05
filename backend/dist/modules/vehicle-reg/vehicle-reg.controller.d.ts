import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { AppAuthRequest } from '../../middlewares/appAuth';
export declare class VehicleRegController {
    /**
     * Create a new vehicle registration application
     * POST /api/vehicle-reg/applications
     */
    createApplication(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's vehicle registration applications by email (if authenticated)
     * GET /api/vehicle-reg/my-applications
     */
    getMyApplications(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Track application by reference ID and PIN (public)
     * GET /api/vehicle-reg/track/:referenceId/:pin
     */
    trackApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all applications (admin)
     * GET /api/vehicle-reg/applications
     */
    listApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get application by ID (admin)
     * GET /api/vehicle-reg/applications/:id
     */
    getApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update application status (admin)
     * PUT /api/vehicle-reg/applications/:id/status
     */
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark payment as received (admin)
     * PUT /api/vehicle-reg/applications/:id/payment
     */
    markPaymentReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark as registered (admin)
     * PUT /api/vehicle-reg/applications/:id/register
     */
    markRegistered(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get dashboard statistics (admin)
     * GET /api/vehicle-reg/dashboard/stats
     */
    getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Download application form as PDF (admin)
     * GET /api/vehicle-reg/applications/:id/download-pdf
     */
    downloadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update admin comments (admin)
     * PUT /api/vehicle-reg/applications/:id/comments
     */
    updateAdminComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Assign application to admin (admin)
     * PUT /api/vehicle-reg/applications/:id/assign
     */
    assignToAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Set application priority (admin)
     * PUT /api/vehicle-reg/applications/:id/priority
     */
    setPriority(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Download blank vehicle registration form PDF (public)
     * GET /api/vehicle-reg/form
     */
    downloadForm(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const vehicleRegController: VehicleRegController;
//# sourceMappingURL=vehicle-reg.controller.d.ts.map