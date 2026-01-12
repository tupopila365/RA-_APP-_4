import { ApiClient, API_ENDPOINTS } from './api';

export const officesService = {
  async getOffices(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.LOCATIONS}?${queryString}`
        : API_ENDPOINTS.LOCATIONS;

      return await ApiClient.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  async getOfficesByRegion(region) {
    try {
      return await this.getOffices({ region });
    } catch (error) {
      throw error;
    }
  },

  async searchOffices(query) {
    try {
      return await this.getOffices({ search: query });
    } catch (error) {
      throw error;
    }
  },
};
