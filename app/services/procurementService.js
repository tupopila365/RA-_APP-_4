import { ApiClient, API_ENDPOINTS } from './api';

export const procurementLegislationService = {
  async getLegislation(params = {}) {
    try {
      // Default to published legislation for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PROCUREMENT_LEGISLATION}?${queryString}`
        : API_ENDPOINTS.PROCUREMENT_LEGISLATION;

      const response = await ApiClient.get(endpoint);
      // Extract items array from nested response format
      // Backend returns: { success, data: { items: [], pagination: {} } }
      return response.data?.items || response.items || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getLegislationBySection(section) {
    try {
      return await this.getLegislation({ section });
    } catch (error) {
      throw error;
    }
  },
};

export const procurementPlanService = {
  async getPlans(params = {}) {
    try {
      // Default to published plans for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PROCUREMENT_PLAN}?${queryString}`
        : API_ENDPOINTS.PROCUREMENT_PLAN;

      const response = await ApiClient.get(endpoint);
      // Extract items array from nested response format
      return response.data?.items || response.items || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },
};

export const procurementAwardsService = {
  async getAwards(params = {}) {
    try {
      // Default to published awards for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PROCUREMENT_AWARDS}?${queryString}`
        : API_ENDPOINTS.PROCUREMENT_AWARDS;

      console.log('[ProcurementAwardsService] Fetching from:', endpoint);
      const response = await ApiClient.get(endpoint);
      console.log('[ProcurementAwardsService] Raw response:', JSON.stringify(response, null, 2));
      
      // Extract items array from nested response format
      const items = response.data?.items || response.items || response.data || response || [];
      console.log('[ProcurementAwardsService] Extracted items count:', items.length);
      
      return items;
    } catch (error) {
      console.error('[ProcurementAwardsService] Error:', error);
      console.error('[ProcurementAwardsService] Error response:', error.response?.data);
      throw error;
    }
  },

  async getAwardsByType(type) {
    try {
      return await this.getAwards({ type });
    } catch (error) {
      throw error;
    }
  },
};

export const procurementOpeningRegisterService = {
  async getItems(params = {}) {
    try {
      // Default to published items for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PROCUREMENT_OPENING_REGISTER}?${queryString}`
        : API_ENDPOINTS.PROCUREMENT_OPENING_REGISTER;

      const response = await ApiClient.get(endpoint);
      // Extract items array from nested response format
      return response.data?.items || response.items || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getItemsByType(type) {
    try {
      return await this.getItems({ type });
    } catch (error) {
      throw error;
    }
  },

  async getItemsByCategory(category) {
    try {
      return await this.getItems({ category });
    } catch (error) {
      throw error;
    }
  },
};

