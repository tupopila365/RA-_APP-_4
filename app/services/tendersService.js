import { ApiClient, API_ENDPOINTS } from './api';

export const tendersService = {
  async getTenders(params = {}) {
    try {
      // Default to published tenders for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.TENDERS}?${queryString}`
        : API_ENDPOINTS.TENDERS;

      const response = await ApiClient.get(endpoint);
      // Extract tenders array from nested response format
      // Backend returns: { success, data: { tenders: [], pagination: {} } }
      return response.data?.tenders || response.tenders || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getTenderDetail(id) {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.TENDERS_DETAIL(id));
      // Extract tender from nested response format
      // Backend returns: { success, data: { tender: {...} } }
      return response.data?.tender || response.tender || response.data || response;
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

  async getTendersByCategory(category) {
    try {
      return await this.getTenders({ category });
    } catch (error) {
      throw error;
    }
  },
};
