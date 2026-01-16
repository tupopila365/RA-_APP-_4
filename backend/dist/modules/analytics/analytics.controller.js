"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const logger_1 = require("../../utils/logger");
class AnalyticsController {
    /**
     * Track a chatbot interaction
     * POST /api/analytics/chatbot
     */
    async trackInteraction(req, res, next) {
        try {
            const analyticsData = {
                responseTime: req.body.responseTime || 0,
                cached: req.body.cached || false,
                userSatisfaction: req.body.userSatisfaction,
                questionCategory: req.body.questionCategory || 'general',
                timestamp: new Date(),
                sessionId: req.body.sessionId || 'unknown',
                errorOccurred: req.body.errorOccurred || false,
                quickReplyUsed: req.body.quickReplyUsed || false
            };
            await analytics_service_1.analyticsService.trackInteraction(analyticsData);
            res.status(200).json({
                success: true,
                message: 'Interaction tracked successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error tracking interaction:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track interaction'
            });
        }
    }
    /**
     * Track user feedback
     * POST /api/analytics/feedback
     */
    async trackFeedback(req, res, next) {
        try {
            const { sessionId, rating, categories, feedback } = req.body;
            if (!sessionId || rating === undefined) {
                res.status(400).json({
                    success: false,
                    error: 'sessionId and rating are required'
                });
                return;
            }
            await analytics_service_1.analyticsService.trackUserFeedback(sessionId, rating, categories || [], feedback);
            res.status(200).json({
                success: true,
                message: 'Feedback tracked successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error tracking feedback:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track feedback'
            });
        }
    }
    /**
     * Get analytics summary for dashboard
     * GET /api/analytics/summary?timeframe=day
     */
    async getAnalyticsSummary(req, res, next) {
        try {
            const timeframe = req.query.timeframe || 'day';
            const summary = await analytics_service_1.analyticsService.getAnalyticsSummary(timeframe);
            res.status(200).json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting analytics summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get analytics summary'
            });
        }
    }
    /**
     * Get improvement recommendations
     * GET /api/analytics/recommendations
     */
    async getRecommendations(req, res, next) {
        try {
            const recommendations = await analytics_service_1.analyticsService.getImprovementRecommendations();
            res.status(200).json({
                success: true,
                data: {
                    recommendations,
                    generatedAt: new Date().toISOString()
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting recommendations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get recommendations'
            });
        }
    }
    /**
     * Get real-time metrics for dashboard
     * GET /api/analytics/realtime
     */
    async getRealtimeMetrics(req, res, next) {
        try {
            const [hourSummary, daySummary] = await Promise.all([
                analytics_service_1.analyticsService.getAnalyticsSummary('hour'),
                analytics_service_1.analyticsService.getAnalyticsSummary('day')
            ]);
            const realtimeData = {
                current: {
                    avgResponseTime: hourSummary.avgResponseTime,
                    cacheHitRate: hourSummary.cacheHitRate,
                    totalInteractions: hourSummary.totalInteractions,
                    errorRate: hourSummary.errorRate
                },
                today: {
                    avgResponseTime: daySummary.avgResponseTime,
                    cacheHitRate: daySummary.cacheHitRate,
                    totalInteractions: daySummary.totalInteractions,
                    avgSatisfaction: daySummary.avgSatisfaction
                },
                trends: {
                    responseTimeHistory: daySummary.responseTimeHistory.slice(-12), // Last 12 data points
                }
            };
            res.status(200).json({
                success: true,
                data: realtimeData
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting realtime metrics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get realtime metrics'
            });
        }
    }
}
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map