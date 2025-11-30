import { ApiClient, API_ENDPOINTS } from './api';

export const newsService = {
  async getNews(params = {}) {
    try {
      // Default to published news for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.NEWS}?${queryString}`
        : API_ENDPOINTS.NEWS;
      
      const response = await ApiClient.get(endpoint);
      // Extract news array from nested response format
      // Backend returns: { success, data: { news: [], pagination: {} } }
      return response.data?.news || response.news || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getNewsDetail(id) {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.NEWS_DETAIL(id));
      // Extract news item from nested response format
      // Backend returns: { success, data: { news: {...} } }
      return response.data?.news || response.news || response.data || response;
    } catch (error) {
      throw error;
    }
  },

  async searchNews(query) {
    try {
      return await this.getNews({ search: query });
    } catch (error) {
      throw error;
    }
  },

  async getNewsByCategory(category) {
    try {
      return await this.getNews({ category });
    } catch (error) {
      throw error;
    }
  },
};
