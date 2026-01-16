import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class NotificationsController {
    /**
     * Register push token (public endpoint - no auth required)
     * POST /api/notifications/register
     */
    registerToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Send manual notification (requires auth)
     * POST /api/notifications/send
     */
    sendNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get notification logs (requires auth)
     * GET /api/notifications/logs
     */
    getNotificationLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get notification stats (requires auth)
     * GET /api/notifications/stats
     */
    getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all registered tokens (for debugging - requires auth)
     * GET /api/notifications/tokens
     */
    getTokens(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const notificationsController: NotificationsController;
//# sourceMappingURL=notifications.controller.d.ts.map