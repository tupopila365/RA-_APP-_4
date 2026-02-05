import { ApiClient } from './api';

export const raServicesService = {
  /**
   * Get all published RA services
   */
  async getServices(params = {}) {
    try {
      const queryParams = { published: true, limit: 100, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString ? `/ra-services?${queryString}` : '/ra-services';

      const response = await ApiClient.get(endpoint);
      return response?.data?.items || response?.items || [];
    } catch (error) {
      console.error('Error fetching RA services:', error);
      throw error;
    }
  },

  /**
   * Get services by category
   */
  async getServicesByCategory(category) {
    try {
      const queryParams = { published: true, category };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = `/ra-services?${queryString}`;

      const response = await ApiClient.get(endpoint);
      return response?.data?.items || response?.items || [];
    } catch (error) {
      console.error('Error fetching RA services by category:', error);
      throw error;
    }
  },

  /**
   * Get a single service by ID
   */
  async getServiceById(id) {
    try {
      const response = await ApiClient.get(`/ra-services/${id}`);
      return response?.data?.service || response?.service;
    } catch (error) {
      console.error('Error fetching RA service:', error);
      throw error;
    }
  },
};
