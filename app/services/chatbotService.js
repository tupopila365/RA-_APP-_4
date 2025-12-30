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
   * Query chatbot with simulated streaming response
   * React Native doesn't support true streaming natively, so we simulate typing effect
   * This gives users visual feedback that the chatbot is working
   * @param {string} question - The user's question
   * @param {string} sessionId - Optional session ID
   * @param {function} onChunk - Callback for each chunk of the response (simulated)
   * @param {function} onMetadata - Callback for metadata (sources, confidence)
   * @param {function} onInteractionId - Callback when interactionId is received
   * @param {function} onComplete - Callback when streaming is complete
   * @param {function} onError - Callback for errors
   */
  async queryStream(question, sessionId = null, { onChunk, onMetadata, onInteractionId, onComplete, onError }) {
    try {
      // Show "thinking" state immediately by sending empty chunk
      if (onChunk) {
        onChunk('', '');
      }

      // Get the full response
      const response = await this.query(question, sessionId);
      
      const answer = response.answer || response.data?.answer || '';
      const sources = response.sources || response.data?.sources || [];
      const interactionId = response.interactionId || response.data?.interactionId;

      // Send metadata immediately
      if (onMetadata && sources.length > 0) {
        onMetadata({
          sources: sources,
          confidence: 0.85, // Default confidence
        });
      }

      // Send interactionId if available
      if (interactionId && onInteractionId) {
        onInteractionId(interactionId);
      }

      // Simulate typing by sending chunks word by word
      if (onChunk && answer) {
        const words = answer.split(' ');
        let currentText = '';
        
        // Type faster for better UX (20ms per word gives ~50 words/sec)
        const typingDelay = 20;
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          currentText += (i > 0 ? ' ' : '') + word;
          
          // Send chunk with accumulated text
          onChunk(word + (i < words.length - 1 ? ' ' : ''), currentText);
          
          // Small delay between words to simulate typing
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, typingDelay));
          }
        }
      }

      // Call onComplete when done
      if (onComplete) {
        onComplete(answer, interactionId);
      }

      return { answer, interactionId, sources };
    } catch (error) {
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

  /**
   * Submit feedback for a chatbot interaction
   * @param {string} interactionId - The interaction ID returned from query
   * @param {string} feedback - 'like' or 'dislike'
   */
  async submitFeedback(interactionId, feedback) {
    try {
      if (!interactionId) {
        throw new Error('Interaction ID is required');
      }

      if (!['like', 'dislike'].includes(feedback)) {
        throw new Error('Feedback must be either "like" or "dislike"');
      }

      const response = await ApiClient.put(
        API_ENDPOINTS.CHATBOT_FEEDBACK(interactionId),
        { feedback },
        { timeout: ENV.API_TIMEOUT || 15000 }
      );

      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
