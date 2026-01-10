import { ApiClient } from './api';
import { mockRoadStatusData, filterMockData, filterByStatus } from '../data/mockRoadStatus';
import env from '../config/env';

// Set to true to use mock data instead of API (useful for development/testing)
const USE_MOCK_DATA = __DEV__; // Use mock data in development mode

export const roadStatusService = {
  async getRoadStatus(query = '') {
    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filteredData = mockRoadStatusData;
        
        // Apply search filter if query provided
        if (query && query.trim()) {
          filteredData = filterMockData(filteredData, query);
        }
        
        return filteredData;
      }

      // Use the public endpoint for roadworks
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const endpoint = `/roadworks/public${queryParams}`;
      
      const response = await ApiClient.get(endpoint);
      // Extract roadworks array from nested response format
      // Backend returns: { success, data: [...] }
      return response.data || response || [];
    } catch (error) {
      // Fallback to mock data if API fails (only in development)
      if (__DEV__) {
        console.warn('API request failed, using mock data:', error.message);
        let filteredData = mockRoadStatusData;
        
        if (query && query.trim()) {
          filteredData = filterMockData(filteredData, query);
        }
        
        return filteredData;
      }
      throw error;
    }
  },

  async searchRoadStatus(query) {
    try {
      return await this.getRoadStatus(query);
    } catch (error) {
      throw error;
    }
  },
};


