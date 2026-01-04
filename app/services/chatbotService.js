import { ApiClient, API_ENDPOINTS } from './api';
import ENV from '../config/env';

export const chatbotService = {
  /**
   * Query chatbot with standard (non-streaming) response
   * @param {string} question - The user's question
   * @param {string} sessionId - Optional session ID
   * @param {object} userLocation - Optional user location with latitude and longitude
   * @param {AbortController} abortController - Optional abort controller for cancellation
   */
  async query(question, sessionId = null, userLocation = null, abortController = null) {
    try {
      const requestBody = {
        question,
        ...(sessionId && { sessionId }),
        ...(userLocation && { userLocation }),
      };

      // Use longer timeout for chatbot queries (60 seconds)
      const options = { timeout: ENV.API_TIMEOUT_LONG || 60000 };
      if (abortController) {
        options.abortController = abortController;
      }

      const response = await ApiClient.post(
        API_ENDPOINTS.CHATBOT_QUERY, 
        requestBody,
        options
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
   * @param {object} userLocation - Optional user location with latitude and longitude
   * @param {object} callbacks - Callback functions and optional abortController
   * @param {function} callbacks.onChunk - Callback for each chunk of the response (simulated)
   * @param {function} callbacks.onMetadata - Callback for metadata (sources, confidence)
   * @param {function} callbacks.onInteractionId - Callback when interactionId is received
   * @param {function} callbacks.onComplete - Callback when streaming is complete
   * @param {function} callbacks.onError - Callback for errors
   * @param {AbortController} callbacks.abortController - Optional AbortController for cancellation
   */
  async queryStream(question, sessionId = null, userLocationOrCallbacks = null, callbacksOrUndefined = null) {
    // Handle backward compatibility: check if third param is callbacks (object with onChunk, etc) or userLocation
    let userLocation = null;
    let callbacks = {};
    
    if (userLocationOrCallbacks) {
      if (userLocationOrCallbacks.onChunk || userLocationOrCallbacks.onMetadata || userLocationOrCallbacks.abortController) {
        // Third param is callbacks object (old signature)
        callbacks = userLocationOrCallbacks;
      } else if (userLocationOrCallbacks.latitude !== undefined || userLocationOrCallbacks.longitude !== undefined) {
        // Third param is userLocation (new signature)
        userLocation = userLocationOrCallbacks;
        callbacks = callbacksOrUndefined || {};
      }
    }
    
    const { onChunk, onMetadata, onInteractionId, onComplete, onError, abortController } = callbacks;
    try {
      // Show "thinking" state immediately by sending empty chunk
      if (onChunk && !abortController?.signal.aborted) {
        onChunk('', '');
      }

      // Check if cancelled before making API call
      if (abortController?.signal.aborted) {
        throw new Error('Request cancelled');
      }

      // Get the full response with abort signal
      const response = await this.query(question, sessionId, userLocation, abortController);
      
      // Check if cancelled after API call
      if (abortController?.signal.aborted) {
        throw new Error('Request cancelled');
      }

      const answer = response.answer || response.data?.answer || '';
      const sources = response.sources || response.data?.sources || [];
      const interactionId = response.interactionId || response.data?.interactionId;
      const metadata = response.metadata || response.data?.metadata;

      // Send metadata immediately (for sources and other metadata like location queries)
      if (onMetadata && (sources.length > 0 || metadata) && !abortController?.signal.aborted) {
        onMetadata({
          sources: sources,
          confidence: 0.85, // Default confidence
          metadata: metadata, // Pass metadata (e.g., location_query metadata)
        });
      }

      // Send interactionId if available
      if (interactionId && onInteractionId && !abortController?.signal.aborted) {
        onInteractionId(interactionId);
      }

      // Simulate typing by sending chunks word by word
      if (onChunk && answer && !abortController?.signal.aborted) {
        const words = answer.split(' ');
        let currentText = '';
        
        // Type faster for better UX (20ms per word gives ~50 words/sec)
        const typingDelay = 20;
        
        for (let i = 0; i < words.length; i++) {
          // Check if cancelled before each chunk
          if (abortController?.signal.aborted) {
            throw new Error('Request cancelled');
          }

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

      // Check if cancelled before calling onComplete
      if (abortController?.signal.aborted) {
        throw new Error('Request cancelled');
      }

      // Call onComplete when done (include metadata if available)
      if (onComplete) {
        onComplete(answer, interactionId, metadata);
      }

      return { answer, interactionId, sources, metadata };
    } catch (error) {
      // Don't call onError if the request was cancelled
      if (!abortController?.signal.aborted && onError) {
        onError(error);
      } else if (abortController?.signal.aborted) {
        // Silently handle cancellation
        return { cancelled: true };
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
