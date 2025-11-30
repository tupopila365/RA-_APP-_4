import { ApiClient, API_ENDPOINTS } from './api';

export const faqsService = {
  async getFAQs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.FAQS}?${queryString}`
        : API_ENDPOINTS.FAQS;

      return await ApiClient.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  async searchFAQs(query) {
    try {
      return await this.getFAQs({ search: query });
    } catch (error) {
      throw error;
    }
  },

  async getFAQsByCategory(category) {
    try {
      return await this.getFAQs({ category });
    } catch (error) {
      throw error;
    }
  },
};
