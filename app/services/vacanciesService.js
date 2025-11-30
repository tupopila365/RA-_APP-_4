import { ApiClient, API_ENDPOINTS } from './api';

export const vacanciesService = {
  async getVacancies(params = {}) {
    try {
      // Default to published vacancies for mobile app
      const queryParams = { published: true, ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.VACANCIES}?${queryString}`
        : API_ENDPOINTS.VACANCIES;

      const response = await ApiClient.get(endpoint);
      // Extract vacancies array from nested response format
      // Backend returns: { success, data: { vacancies: [], pagination: {} } }
      return response.data?.vacancies || response.vacancies || response.data || response || [];
    } catch (error) {
      throw error;
    }
  },

  async getVacancyDetail(id) {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.VACANCIES_DETAIL(id));
      // Extract vacancy from nested response format
      // Backend returns: { success, data: { vacancy: {...} } }
      return response.data?.vacancy || response.vacancy || response.data || response;
    } catch (error) {
      throw error;
    }
  },

  async searchVacancies(query) {
    try {
      return await this.getVacancies({ search: query });
    } catch (error) {
      throw error;
    }
  },

  async getVacanciesByType(type) {
    try {
      return await this.getVacancies({ type });
    } catch (error) {
      throw error;
    }
  },

  async getVacanciesByDepartment(department) {
    try {
      return await this.getVacancies({ department });
    } catch (error) {
      throw error;
    }
  },

  async getVacanciesByLocation(location) {
    try {
      return await this.getVacancies({ location });
    } catch (error) {
      throw error;
    }
  },
};
