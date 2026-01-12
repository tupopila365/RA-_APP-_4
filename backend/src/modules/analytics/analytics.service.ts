import { logger } from '../../utils/logger';
import { cacheService } from '../../utils/cache';

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
  responseTimeHistory: Array<{ timestamp: Date; responseTime: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  contentGaps: Array<{ topic: string; frequency: number; coverage: number }>;
}

class AnalyticsService {
  private analytics: ChatbotAnalytics[] = [];
  private readonly MAX_ANALYTICS_HISTORY = 10000;

  /**
   * Track a chatbot interaction
   */
  async trackInteraction(data: ChatbotAnalytics): Promise<void> {
    try {
      // Add to in-memory storage
      this.analytics.push(data);
      
      // Keep only recent data in memory
      if (this.analytics.length > this.MAX_ANALYTICS_HISTORY) {
        this.analytics = this.analytics.slice(-this.MAX_ANALYTICS_HISTORY);
      }

      // Cache for persistence (optional - could also use database)
      const cacheKey = `analytics:${data.sessionId}:${Date.now()}`;
      await cacheService.set('chatbot_analytics', cacheKey, data, 86400); // 24 hours

      logger.debug('Tracked chatbot interaction', {
        sessionId: data.sessionId,
        responseTime: data.responseTime,
        cached: data.cached
      });
    } catch (error: any) {
      logger.error('Failed to track analytics:', error);
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  async getAnalyticsSummary(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<AnalyticsSummary> {
    try {
      const now = new Date();
      const timeframeDuration = this.getTimeframeDuration(timeframe);
      const cutoffTime = new Date(now.getTime() - timeframeDuration);

      // Filter analytics by timeframe
      const recentAnalytics = this.analytics.filter(
        a => a.timestamp >= cutoffTime
      );

      if (recentAnalytics.length === 0) {
        return this.getEmptyAnalyticsSummary();
      }

      // Calculate metrics
      const totalInteractions = recentAnalytics.length;
      const cacheHits = recentAnalytics.filter(a => a.cached).length;
      const satisfactionRatings = recentAnalytics
        .filter(a => a.userSatisfaction !== undefined)
        .map(a => a.userSatisfaction!);
      const quickReplyUsed = recentAnalytics.filter(a => a.quickReplyUsed).length;
      const errors = recentAnalytics.filter(a => a.errorOccurred).length;

      const avgResponseTime = recentAnalytics.reduce((sum, a) => sum + a.responseTime, 0) / totalInteractions;
      const cacheHitRate = cacheHits / totalInteractions;
      const avgSatisfaction = satisfactionRatings.length > 0 
        ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
        : 0;
      const quickReplyUsage = quickReplyUsed / totalInteractions;
      const errorRate = errors / totalInteractions;

      // Response time history (last 24 data points)
      const responseTimeHistory = recentAnalytics
        .slice(-24)
        .map(a => ({
          timestamp: a.timestamp,
          responseTime: a.responseTime
        }));

      // Top questions (would need question text tracking)
      const topQuestions = await this.getTopQuestions(timeframe);

      // Content gaps analysis
      const contentGaps = await this.analyzeContentGaps(timeframe);

      return {
        avgResponseTime,
        cacheHitRate,
        avgSatisfaction,
        quickReplyUsage,
        totalInteractions,
        errorRate,
        responseTimeHistory,
        topQuestions,
        contentGaps
      };

    } catch (error: any) {
      logger.error('Failed to generate analytics summary:', error);
      return this.getEmptyAnalyticsSummary();
    }
  }

  /**
   * Track user feedback
   */
  async trackUserFeedback(sessionId: string, rating: number, categories: string[], feedback?: string): Promise<void> {
    try {
      const feedbackData = {
        sessionId,
        rating,
        categories,
        feedback,
        timestamp: new Date()
      };

      // Update the corresponding analytics entry
      const analyticsEntry = this.analytics
        .reverse()
        .find(a => a.sessionId === sessionId);
      
      if (analyticsEntry) {
        analyticsEntry.userSatisfaction = rating;
      }

      // Cache feedback separately for detailed analysis
      const cacheKey = `feedback:${sessionId}:${Date.now()}`;
      await cacheService.set('chatbot_feedback', cacheKey, feedbackData, 86400 * 7); // 7 days

      logger.info('User feedback tracked', {
        sessionId,
        rating,
        categoriesCount: categories.length
      });
    } catch (error: any) {
      logger.error('Failed to track user feedback:', error);
    }
  }

  /**
   * Get improvement recommendations based on analytics
   */
  async getImprovementRecommendations(): Promise<string[]> {
    const summary = await this.getAnalyticsSummary('week');
    const recommendations: string[] = [];

    // Response time recommendations
    if (summary.avgResponseTime > 5) {
      recommendations.push('Consider optimizing response time - current average is above 5 seconds');
    }

    // Cache hit rate recommendations
    if (summary.cacheHitRate < 0.4) {
      recommendations.push('Low cache hit rate detected - review caching strategy');
    }

    // User satisfaction recommendations
    if (summary.avgSatisfaction < 3.5 && summary.avgSatisfaction > 0) {
      recommendations.push('User satisfaction is below target - review response quality');
    }

    // Error rate recommendations
    if (summary.errorRate > 0.1) {
      recommendations.push('High error rate detected - investigate system stability');
    }

    // Quick reply usage recommendations
    if (summary.quickReplyUsage < 0.2) {
      recommendations.push('Low quick reply usage - consider improving suggestion relevance');
    }

    // Content gap recommendations
    if (summary.contentGaps.length > 0) {
      const topGap = summary.contentGaps[0];
      recommendations.push(`Content gap identified: "${topGap.topic}" - consider adding more documentation`);
    }

    return recommendations;
  }

  private getTimeframeDuration(timeframe: 'hour' | 'day' | 'week'): number {
    switch (timeframe) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private getEmptyAnalyticsSummary(): AnalyticsSummary {
    return {
      avgResponseTime: 0,
      cacheHitRate: 0,
      avgSatisfaction: 0,
      quickReplyUsage: 0,
      totalInteractions: 0,
      errorRate: 0,
      responseTimeHistory: [],
      topQuestions: [],
      contentGaps: []
    };
  }

  private async getTopQuestions(timeframe: string): Promise<Array<{ question: string; count: number }>> {
    // This would require storing question text in analytics
    // For now, return empty array
    return [];
  }

  private async analyzeContentGaps(timeframe: string): Promise<Array<{ topic: string; frequency: number; coverage: number }>> {
    // This would require more sophisticated analysis
    // For now, return empty array
    return [];
  }
}

export const analyticsService = new AnalyticsService();