import { ApiClient } from './api';
import env from '../config/env';

// Always use real data from the database - no mock data
const USE_MOCK_DATA = false;

export const roadStatusService = {
  async getRoadStatus(query = '') {
    try {
      // Always use real data from the database via API
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const endpoint = `/roadworks/public${queryParams}`;
      
      const response = await ApiClient.get(endpoint);
      
      // Handle the API response format
      // Backend returns: { success: true, data: [...], timestamp: "..." }
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      // Fallback to empty array if response format is unexpected
      console.warn('Unexpected API response format:', response);
      return [];
    } catch (error) {
      console.error('Road status API error:', error);
      
      // Always throw error - no fallback to mock data
      // This ensures the UI can handle the error state properly
      throw new Error(`Failed to load road status: ${error.message || 'Network error'}`);
    }
  },

  async searchRoadStatus(query) {
    try {
      return await this.getRoadStatus(query);
    } catch (error) {
      console.error('Road status search error:', error);
      throw error;
    }
  },
};