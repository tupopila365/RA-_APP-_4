import { ChatbotInteraction } from './interactions.entity';
import type { FeedbackType } from './interactions.model';
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
    interactions: ChatbotInteraction[];
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
    detectCategory(question: string): string;
    logInteraction(dto: LogInteractionDTO): Promise<ChatbotInteraction>;
    updateFeedback(interactionId: string, dto: UpdateFeedbackDTO): Promise<ChatbotInteraction>;
    getInteractions(query: ListInteractionsQuery): Promise<ListInteractionsResult>;
    getMetrics(startDate?: Date, endDate?: Date): Promise<MetricsResult>;
}
export declare const interactionsService: InteractionsService;
export {};
//# sourceMappingURL=interactions.service.d.ts.map