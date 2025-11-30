import { newsService } from '../../services/newsService';
import { tendersService } from '../../services/tendersService';
import { vacanciesService } from '../../services/vacanciesService';
import { locationsService } from '../../services/locationsService';
import { bannersService } from '../../services/bannersService';
import { chatbotService } from '../../services/chatbotService';
import { ApiClient } from '../../services/api';

// Mock ApiClient
jest.mock('../../services/api', () => ({
  ApiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  API_ENDPOINTS: {
    NEWS: '/api/news',
    NEWS_DETAIL: (id) => `/api/news/${id}`,
    TENDERS: '/api/tenders',
    TENDER_DETAIL: (id) => `/api/tenders/${id}`,
    VACANCIES: '/api/vacancies',
    VACANCY_DETAIL: (id) => `/api/vacancies/${id}`,
    LOCATIONS: '/api/locations',
    BANNERS: '/api/banners',
    CHATBOT_QUERY: '/api/chatbot/query',
  },
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('News API Integration', () => {
    it('fetches and displays news articles', async () => {
      const mockNews = {
        data: [
          { id: 1, title: 'News 1', category: 'Safety', published: true },
          { id: 2, title: 'News 2', category: 'Infrastructure', published: true },
        ],
      };

      ApiClient.get.mockResolvedValue(mockNews);

      const result = await newsService.getNews();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('News 1');
      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/news')
      );
    });

    it('handles news search correctly', async () => {
      const mockSearchResults = {
        data: [{ id: 1, title: 'Road Safety Campaign', category: 'Safety' }],
      };

      ApiClient.get.mockResolvedValue(mockSearchResults);

      const result = await newsService.searchNews('road safety');

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Road Safety');
    });
  });

  describe('Tenders API Integration', () => {
    it('fetches tenders with status filter', async () => {
      const mockTenders = {
        data: [
          { id: 1, title: 'Tender 1', status: 'open', published: true },
        ],
      };

      ApiClient.get.mockResolvedValue(mockTenders);

      const result = await tendersService.getTendersByStatus('open');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('open');
      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=open')
      );
    });

    it('fetches tender details with PDF URL', async () => {
      const mockTender = {
        data: {
          id: 1,
          title: 'Construction Tender',
          pdfUrl: 'https://example.com/tender.pdf',
        },
      };

      ApiClient.get.mockResolvedValue(mockTender);

      const result = await tendersService.getTenderDetail(1);

      expect(result.pdfUrl).toBeTruthy();
      expect(result.pdfUrl).toContain('.pdf');
    });
  });

  describe('Vacancies API Integration', () => {
    it('fetches vacancies with type filter', async () => {
      const mockVacancies = {
        data: [
          { id: 1, title: 'Engineer', type: 'full-time', published: true },
          { id: 2, title: 'Intern', type: 'internship', published: true },
        ],
      };

      ApiClient.get.mockResolvedValue(mockVacancies);

      const result = await vacanciesService.getVacanciesByType('full-time');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=full-time')
      );
    });
  });

  describe('Locations API Integration', () => {
    it('fetches locations grouped by region', async () => {
      const mockLocations = {
        data: [
          { id: 1, name: 'Windhoek Office', region: 'Khomas' },
          { id: 2, name: 'Swakopmund Office', region: 'Erongo' },
        ],
      };

      ApiClient.get.mockResolvedValue(mockLocations);

      const result = await locationsService.getLocations();

      expect(result).toHaveLength(2);
      expect(result[0].region).toBeTruthy();
    });

    it('filters locations by region', async () => {
      const mockLocations = {
        data: [{ id: 1, name: 'Windhoek Office', region: 'Khomas' }],
      };

      ApiClient.get.mockResolvedValue(mockLocations);

      const result = await locationsService.getLocationsByRegion('Khomas');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('region=Khomas')
      );
    });
  });

  describe('Banners API Integration', () => {
    it('fetches active banners in order', async () => {
      const mockBanners = {
        data: [
          { id: 1, title: 'Banner 1', active: true, order: 1 },
          { id: 2, title: 'Banner 2', active: true, order: 2 },
        ],
      };

      ApiClient.get.mockResolvedValue(mockBanners);

      const result = await bannersService.getBanners();

      expect(result).toHaveLength(2);
      expect(result.every(b => b.active)).toBe(true);
    });
  });

  describe('Chatbot API Integration', () => {
    it('sends query and receives answer with sources', async () => {
      const mockResponse = {
        data: {
          answer: 'Road safety is important...',
          sources: [
            { documentId: '1', title: 'Safety Guidelines', relevance: 0.9 },
          ],
        },
      };

      ApiClient.post.mockResolvedValue(mockResponse);

      const result = await chatbotService.sendQuery('What is road safety?');

      expect(result.answer).toBeTruthy();
      expect(result.sources).toHaveLength(1);
      expect(ApiClient.post).toHaveBeenCalledWith(
        '/api/chatbot/query',
        expect.objectContaining({ question: 'What is road safety?' })
      );
    });

    it('handles chatbot errors gracefully', async () => {
      ApiClient.post.mockRejectedValue(new Error('Service unavailable'));

      await expect(
        chatbotService.sendQuery('Question')
      ).rejects.toThrow('Service unavailable');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors across all services', async () => {
      const networkError = new Error('Network request failed');
      ApiClient.get.mockRejectedValue(networkError);

      await expect(newsService.getNews()).rejects.toThrow('Network request failed');
      await expect(tendersService.getTenders()).rejects.toThrow('Network request failed');
      await expect(vacanciesService.getVacancies()).rejects.toThrow('Network request failed');
      await expect(locationsService.getLocations()).rejects.toThrow('Network request failed');
      await expect(bannersService.getBanners()).rejects.toThrow('Network request failed');
    });

    it('handles 404 errors for detail endpoints', async () => {
      const notFoundError = new Error('Not found');
      ApiClient.get.mockRejectedValue(notFoundError);

      await expect(newsService.getNewsDetail(999)).rejects.toThrow('Not found');
      await expect(tendersService.getTenderDetail(999)).rejects.toThrow('Not found');
      await expect(vacanciesService.getVacancyDetail(999)).rejects.toThrow('Not found');
    });
  });
});
