import { ApiClient, API_ENDPOINTS } from './api';

export const bannersService = {
  async getBanners(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.BANNERS}?${queryString}`
        : API_ENDPOINTS.BANNERS;

      const response = await ApiClient.get(endpoint);
      // Extract banners array from nested response format
      // Backend returns: { success, data: { banners: [], pagination: {} } }
      return response.data?.banners || response.banners || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getActiveBanners() {
    try {
      // Public endpoint returns only active banners by default
      return await this.getBanners();
    } catch (error) {
      throw error;
    }
  },

  async getBannerDetail(id) {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.BANNERS_DETAIL(id));
      // Extract banner from nested response format
      // Backend returns: { success, data: { banner: {...} } }
      return response.data?.banner || response.banner || response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
