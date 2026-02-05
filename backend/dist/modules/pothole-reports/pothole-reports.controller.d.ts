import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { AppAuthRequest } from '../../middlewares/appAuth';
export declare class PotholeReportsController {
    /**
     * Create a new pothole report
     * POST /api/pothole-reports
     */
    createReport(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's reports by email (if authenticated) or device ID
     * GET /api/pothole-reports/my-reports
     */
    getMyReports(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single report by ID
     * GET /api/pothole-reports/:id
     */
    getReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all reports with filtering (admin)
     * GET /api/pothole-reports
     */
    listReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update report status
     * PUT /api/pothole-reports/:id/status
     */
    updateReportStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Assign report to maintenance team
     * PUT /api/pothole-reports/:id/assign
     */
    assignReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add admin notes to report
     * PUT /api/pothole-reports/:id/notes
     */
    addAdminNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Mark report as fixed
     * PUT /api/pothole-reports/:id/fixed
     */
    markAsFixed(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a report
     * DELETE /api/pothole-reports/:id
     */
    deleteReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get regions and towns for filtering
     * GET /api/pothole-reports/filters/regions-towns
     */
    getRegionsAndTowns(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const potholeReportsController: PotholeReportsController;
//# sourceMappingURL=pothole-reports.controller.d.ts.map