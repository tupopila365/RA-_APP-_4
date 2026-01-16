import { Request, Response, NextFunction } from 'express';
declare class AnalyticsController {
    /**
     * Track a chatbot interaction
     * POST /api/analytics/chatbot
     */
    trackInteraction(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Track user feedback
     * POST /api/analytics/feedback
     */
    trackFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get analytics summary for dashboard
     * GET /api/analytics/summary?timeframe=day
     */
    getAnalyticsSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get improvement recommendations
     * GET /api/analytics/recommendations
     */
    getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get real-time metrics for dashboard
     * GET /api/analytics/realtime
     */
    getRealtimeMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const analyticsController: AnalyticsController;
export {};
//# sourceMappingURL=analytics.controller.d.ts.map