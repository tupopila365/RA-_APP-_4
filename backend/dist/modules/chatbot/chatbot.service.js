"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotService = void 0;
const httpClient_1 = require("../../utils/httpClient");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ChatbotService {
    /**
     * Process a user query by forwarding it to the RAG service
     * and formatting the response with source document references
     */
    async processQuery(queryRequest) {
        const { question, sessionId } = queryRequest;
        logger_1.logger.info('Processing chatbot query', { question, sessionId });
        try {
            // Forward query to RAG service
            const ragResponse = await httpClient_1.ragService.queryDocuments(question);
            // Format response with source document references
            const formattedResponse = {
                answer: ragResponse.answer || 'I apologize, but I could not find relevant information to answer your question.',
                sources: this.formatSources(ragResponse.sources || []),
                timestamp: new Date(),
            };
            logger_1.logger.info('Chatbot query processed successfully', {
                question,
                sourcesCount: formattedResponse.sources.length,
            });
            return formattedResponse;
        }
        catch (error) {
            logger_1.logger.error('Error processing chatbot query:', error);
            // If RAG service is unavailable, provide a helpful error message
            if (error.code === errors_1.ERROR_CODES.RAG_SERVICE_UNAVAILABLE || error.code === errors_1.ERROR_CODES.RAG_QUERY_FAILED) {
                throw {
                    statusCode: 503,
                    code: error.code,
                    message: 'The chatbot service is temporarily unavailable. Please try again later.',
                    details: error.details,
                };
            }
            // For other errors, throw a generic error
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.SERVER_ERROR,
                message: 'An error occurred while processing your question',
                details: error.message,
            };
        }
    }
    /**
     * Format source documents from RAG service response
     */
    formatSources(sources) {
        return sources.map((source) => ({
            documentId: source.document_id || source.documentId || '',
            title: source.document_title || source.title || 'Unknown Document',
            relevance: source.relevance || source.score || 0,
        }));
    }
    /**
     * Health check for chatbot service
     */
    async healthCheck() {
        try {
            const ragHealth = await httpClient_1.ragService.healthCheck();
            return {
                status: 'healthy',
                ragServiceConnected: ragHealth.status === 'healthy',
            };
        }
        catch (error) {
            logger_1.logger.error('Chatbot health check failed:', error);
            return {
                status: 'unhealthy',
                ragServiceConnected: false,
            };
        }
    }
}
exports.chatbotService = new ChatbotService();
//# sourceMappingURL=chatbot.service.js.map