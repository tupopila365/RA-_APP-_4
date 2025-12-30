import { IChatbotInteraction, FeedbackType } from './interactions.model';
export interface LogInteractionDTO {
    question: string;
    answer: string;
    sessionId: string;
    category?: string;
}
export interface UpdateFeedbackDTO {
    feedback: FeedbackType;
    comment?: string;
}
export interface ListInteractionsQuery {
    page?: number;
    limit?: number;
    feedback?: FeedbackType;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    sessionId?: string;
}
export interface ListInteractionsResult {
    interactions: IChatbotInteraction[];
    total: number;
    page: number;
    totalPages: number;
}
export interface MetricsResult {
    totalQuestions: number;
    totalLikes: number;
    totalDislikes: number;
    likeDislikeRatio: number;
    mostDislikedQuestions: Array<{
        question: string;
        answer: string;
        dislikeCount: number;
        interactionId: string;
    }>;
    questionsByCategory: Record<string, number>;
    questionsOverTime: Array<{
        date: string;
        count: number;
    }>;
}
declare class InteractionsService {
    /**
     * Auto-detect category from question text using keyword matching
     */
    detectCategory(question: string): string;
    /**
     * Log a new interaction after chatbot query
     */
    logInteraction(dto: LogInteractionDTO): Promise<IChatbotInteraction>;
    /**
     * Update feedback for an existing interaction
     */
    updateFeedback(interactionId: string, dto: UpdateFeedbackDTO): Promise<IChatbotInteraction>;
    /**
     * Get interactions with pagination and filtering
     */
    getInteractions(query: ListInteractionsQuery): Promise<ListInteractionsResult>;
    /**
     * Get metrics and statistics
     */
    getMetrics(startDate?: Date, endDate?: Date): Promise<MetricsResult>;
}
export declare const interactionsService: InteractionsService;
export {};
//# sourceMappingURL=interactions.service.d.ts.map