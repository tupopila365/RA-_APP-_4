import { ragService } from '../../utils/httpClient';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

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

class ChatbotService {
  /**
   * Process a user query by forwarding it to the RAG service
   * and formatting the response with source document references
   */
  async processQuery(queryRequest: ChatbotQueryRequest): Promise<ChatbotResponse> {
    const { question, sessionId } = queryRequest;

    logger.info('Processing chatbot query', { question, sessionId });

    try {
      // Forward query to RAG service
      const ragResponse = await ragService.queryDocuments(question);

      // Format response with source document references
      const formattedResponse: ChatbotResponse = {
        answer: ragResponse.answer || 'I apologize, but I could not find relevant information to answer your question.',
        sources: this.formatSources(ragResponse.sources || []),
        timestamp: new Date(),
      };

      logger.info('Chatbot query processed successfully', {
        question,
        sourcesCount: formattedResponse.sources.length,
      });

      return formattedResponse;
    } catch (error: any) {
      logger.error('Error processing chatbot query:', error);

      // If RAG service is unavailable, provide a helpful error message
      if (error.code === ERROR_CODES.RAG_SERVICE_UNAVAILABLE || error.code === ERROR_CODES.RAG_QUERY_FAILED) {
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
        code: ERROR_CODES.SERVER_ERROR,
        message: 'An error occurred while processing your question',
        details: error.message,
      };
    }
  }

  /**
   * Format source documents from RAG service response
   */
  private formatSources(sources: any[]): ChatbotSource[] {
    return sources.map((source) => ({
      documentId: source.document_id || source.documentId || '',
      title: source.document_title || source.title || 'Unknown Document',
      relevance: source.relevance || source.score || 0,
    }));
  }

  /**
   * Health check for chatbot service
   */
  async healthCheck(): Promise<{ status: string; ragServiceConnected: boolean }> {
    try {
      const ragHealth = await ragService.healthCheck();
      return {
        status: 'healthy',
        ragServiceConnected: ragHealth.status === 'healthy',
      };
    } catch (error) {
      logger.error('Chatbot health check failed:', error);
      return {
        status: 'unhealthy',
        ragServiceConnected: false,
      };
    }
  }
}

export const chatbotService = new ChatbotService();
