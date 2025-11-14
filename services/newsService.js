import { ApiClient, API_ENDPOINTS } from './api';

export const newsService = {
  async getNews(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.NEWS}?${queryString}`
        : API_ENDPOINTS.NEWS;
      
      return await ApiClient.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  async getNewsDetail(id) {
    try {
      return await ApiClient.get(API_ENDPOINTS.NEWS_DETAIL(id));
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
