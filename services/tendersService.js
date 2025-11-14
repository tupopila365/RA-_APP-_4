import { ApiClient, API_ENDPOINTS } from './api';

export const tendersService = {
  async getTenders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.TENDERS}?${queryString}`
        : API_ENDPOINTS.TENDERS;

      return await ApiClient.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  async getTenderDetail(id) {
    try {
      return await ApiClient.get(API_ENDPOINTS.TENDERS_DETAIL(id));
    } catch (error) {
      throw error;
    }
  },

  async searchTenders(query) {
    try {
      return await this.getTenders({ search: query });
    } catch (error) {
      throw error;
    }
  },

  async getTendersByStatus(status) {
    try {
      return await this.getTenders({ status });
    } catch (error) {
      throw error;
    }
  },
};
