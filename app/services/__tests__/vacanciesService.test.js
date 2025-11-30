import { vacanciesService } from '../vacanciesService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    VACANCIES: '/vacancies',
    VACANCIES_DETAIL: (id) => `/vacancies/${id}`,
  },
}));

describe('vacanciesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVacancies', () => {
    it('fetches vacancies successfully', async () => {
      const mockVacancies = {
        data: [
          { id: 1, title: 'Engineer', type: 'full-time' },
          { id: 2, title: 'Intern', type: 'internship' },
        ],
      };

      ApiClient.get.mockResolvedValue(mockVacancies);

      const result = await vacanciesService.getVacancies();

      expect(ApiClient.get).toHaveBeenCalledWith('/vacancies?published=true');
      expect(result).toEqual(mockVacancies.data);
    });

    it('fetches vacancies with type filter', async () => {
      const mockVacancies = { data: [] };
      ApiClient.get.mockResolvedValue(mockVacancies);

      await vacanciesService.getVacancies({ type: 'bursary' });

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=bursary')
      );
    });

    it('handles API errors', async () => {
      const error = new Error('Network error');
      ApiClient.get.mockRejectedValue(error);

      await expect(vacanciesService.getVacancies()).rejects.toThrow('Network error');
    });
  });

  describe('getVacancyDetail', () => {
    it('fetches vacancy detail successfully', async () => {
      const mockVacancy = {
        data: { 
          id: 1, 
          title: 'Software Engineer', 
          requirements: ['Degree in CS'],
          responsibilities: ['Develop software']
        },
      };

      ApiClient.get.mockResolvedValue(mockVacancy);

      const result = await vacanciesService.getVacancyDetail(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/vacancies/1');
      expect(result).toEqual(mockVacancy.data);
    });
  });

  describe('searchVacancies', () => {
    it('searches vacancies with query', async () => {
      const mockVacancies = { data: [] };
      ApiClient.get.mockResolvedValue(mockVacancies);

      await vacanciesService.searchVacancies('engineer');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=engineer')
      );
    });
  });

  describe('getVacanciesByType', () => {
    it('fetches vacancies by type', async () => {
      const mockVacancies = { data: [] };
      ApiClient.get.mockResolvedValue(mockVacancies);

      await vacanciesService.getVacanciesByType('part-time');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=part-time')
      );
    });
  });
});
