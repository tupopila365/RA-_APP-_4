import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
declare class InteractionsController {
    /**
     * Update feedback for an interaction
     * PUT /api/chatbot/interactions/:id/feedback
     * Public endpoint (no auth required for mobile app users)
     */
    updateFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * List interactions with filtering and pagination
     * GET /api/chatbot/interactions
     * Admin only endpoint
     */
    listInteractions(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get metrics and statistics
     * GET /api/chatbot/interactions/metrics
     * Admin only endpoint
     */
    getMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const interactionsController: InteractionsController;
export {};
//# sourceMappingURL=interactions.controller.d.ts.map