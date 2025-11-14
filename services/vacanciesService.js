import { ApiClient, API_ENDPOINTS } from './api';

export const vacanciesService = {
  async getVacancies(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.VACANCIES}?${queryString}`
        : API_ENDPOINTS.VACANCIES;

      return await ApiClient.get(endpoint);
    } catch (error) {
      throw error;
    }
  },

  async getVacancyDetail(id) {
    try {
      return await ApiClient.get(API_ENDPOINTS.VACANCIES_DETAIL(id));
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

  async applyForVacancy(vacancyId, applicationData) {
    try {
      return await ApiClient.post(
        `${API_ENDPOINTS.VACANCIES}/${vacancyId}/apply`,
        applicationData
      );
    } catch (error) {
      throw error;
    }
  },
};
