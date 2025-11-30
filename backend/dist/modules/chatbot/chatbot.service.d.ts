export interface ChatbotQueryRequest {
    question: string;
    sessionId?: string;
}
export interface ChatbotSource {
    documentId: string;
    title: string;
    relevance: number;
}
export interface ChatbotResponse {
    answer: string;
    sources: ChatbotSource[];
    timestamp: Date;
}
declare class ChatbotService {
    /**
     * Process a user query by forwarding it to the RAG service
     * and formatting the response with source document references
     */
    processQuery(queryRequest: ChatbotQueryRequest): Promise<ChatbotResponse>;
    /**
     * Format source documents from RAG service response
     */
    private formatSources;
    /**
     * Health check for chatbot service
     */
    healthCheck(): Promise<{
        status: string;
        ragServiceConnected: boolean;
    }>;
}
export declare const chatbotService: ChatbotService;
export {};
//# sourceMappingURL=chatbot.service.d.ts.map