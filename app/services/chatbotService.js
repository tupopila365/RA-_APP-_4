import { ApiClient, API_ENDPOINTS } from './api';
import ENV from '../config/env';

export const chatbotService = {
  /**
   * Query chatbot with standard (non-streaming) response
   */
  async query(question, sessionId = null) {
    try {
      const requestBody = {
        question,
        ...(sessionId && { sessionId }),
      };

      // Use longer timeout for chatbot queries (60 seconds)
      const response = await ApiClient.post(
        API_ENDPOINTS.CHATBOT_QUERY, 
        requestBody,
        { timeout: ENV.API_TIMEOUT_LONG || 60000 }
      );
      // Extract data from new API response format
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Query chatbot with streaming response
   * @param {string} question - The user's question
   * @param {function} onChunk - Callback for each chunk of the response
   * @param {function} onMetadata - Callback for metadata (sources, confidence)
   * @param {function} onComplete - Callback when streaming is complete
   * @param {function} onError - Callback for errors
   */
  async queryStream(question, { onChunk, onMetadata, onComplete, onError }) {
    const controller = new AbortController();
    // Use streaming timeout from config (2 minutes default)
    const streamTimeout = ENV.API_TIMEOUT_STREAM || 120000;
    const timeoutId = setTimeout(() => controller.abort(), streamTimeout);

    try {
      const response = await fetch(`${ENV.API_BASE_URL}/chatbot/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'metadata':
                if (onMetadata) {
                  onMetadata({
                    sources: data.sources,
                    confidence: data.confidence,
                  });
                }
                break;

              case 'chunk':
                fullAnswer += data.content;
                if (onChunk) {
                  onChunk(data.content, fullAnswer);
                }
                break;

              case 'done':
                if (onComplete) {
                  onComplete(fullAnswer);
                }
                return { answer: fullAnswer };

              case 'complete':
                // No results found case
                if (onComplete) {
                  onComplete(data.answer);
                }
                return {
                  answer: data.answer,
                  sources: data.sources,
                  confidence: data.confidence,
                };

              case 'error':
                throw new Error(data.message || 'Streaming error');
            }
          }
        }
      }

      return { answer: fullAnswer };
    } catch (error) {
      clearTimeout(timeoutId);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.CHATBOT_HEALTH);
      // Extract data from new API response format
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
