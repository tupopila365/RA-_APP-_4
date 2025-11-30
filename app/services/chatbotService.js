import { ApiClient, API_ENDPOINTS } from './api';

export const chatbotService = {
  async query(question, sessionId = null) {
    try {
      const requestBody = {
        question,
        ...(sessionId && { sessionId }),
      };

      const response = await ApiClient.post(API_ENDPOINTS.CHATBOT_QUERY, requestBody);
      // Extract data from new API response format
      return response.data || response;
    } catch (error) {
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
