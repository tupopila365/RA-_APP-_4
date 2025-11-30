import { ApiClient, API_ENDPOINTS } from './api';

export const locationsService = {
  async getLocations(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.LOCATIONS}?${queryString}`
        : API_ENDPOINTS.LOCATIONS;

      const response = await ApiClient.get(endpoint);
      // Extract locations array from nested response format
      // Backend returns: { success, data: { locations: [], pagination: {} } }
      return response.data?.locations || response.locations || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getLocationDetail(id) {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.LOCATIONS_DETAIL(id));
      // Extract location from nested response format
      // Backend returns: { success, data: { location: {...} } }
      return response.data?.location || response.location || response.data || response;
    } catch (error) {
      throw error;
    }
  },

  async getLocationsByRegion(region) {
    try {
      return await this.getLocations({ region });
    } catch (error) {
      throw error;
    }
  },

  async searchLocations(query) {
    try {
      return await this.getLocations({ search: query });
    } catch (error) {
      throw error;
    }
  },
};
