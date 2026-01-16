export interface ChatbotAnalytics {
    responseTime: number;
    cached: boolean;
    userSatisfaction?: number;
    questionCategory: string;
    timestamp: Date;
    sessionId: string;
    errorOccurred: boolean;
    quickReplyUsed: boolean;
}
export interface AnalyticsSummary {
    avgResponseTime: number;
    cacheHitRate: number;
    avgSatisfaction: number;
    quickReplyUsage: number;
    totalInteractions: number;
    errorRate: number;
    responseTimeHistory: Array<{
        timestamp: Date;
        responseTime: number;
    }>;
    topQuestions: Array<{
        question: string;
        count: number;
    }>;
    contentGaps: Array<{
        topic: string;
        frequency: number;
        coverage: number;
    }>;
}
declare class AnalyticsService {
    private analytics;
    private readonly MAX_ANALYTICS_HISTORY;
    /**
     * Track a chatbot interaction
     */
    trackInteraction(data: ChatbotAnalytics): Promise<void>;
    /**
     * Get analytics summary for dashboard
     */
    getAnalyticsSummary(timeframe?: 'hour' | 'day' | 'week'): Promise<AnalyticsSummary>;
    /**
     * Track user feedback
     */
    trackUserFeedback(sessionId: string, rating: number, categories: string[], feedback?: string): Promise<void>;
    /**
     * Get improvement recommendations based on analytics
     */
    getImprovementRecommendations(): Promise<string[]>;
    private getTimeframeDuration;
    private getEmptyAnalyticsSummary;
    private getTopQuestions;
    private analyzeContentGaps;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analytics.service.d.ts.map