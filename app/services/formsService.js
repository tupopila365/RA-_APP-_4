import { ApiClient } from './api';

export const formsService = {
  /**
   * Get all published forms
   */
  async getForms(params = {}) {
    try {
      // Default to published forms for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString 
        ? `/forms?${queryString}`
        : '/forms';
      
      const response = await ApiClient.get(endpoint);
      return response.data?.data?.items || response.data?.items || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },

  /**
   * Get forms by category
   */
  async getFormsByCategory(category) {
    try {
      const queryParams = { published: true, category };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = `/forms?${queryString}`;
      
      const response = await ApiClient.get(endpoint);
      return response.data?.data?.items || response.data?.items || [];
    } catch (error) {
      console.error('Error fetching forms by category:', error);
      throw error;
    }
  },

  /**
   * Get a single form by ID
   */
  async getFormById(id) {
    try {
      const response = await ApiClient.get(`/forms/${id}`);
      return response.data?.data?.form || response.data?.form;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },
};
