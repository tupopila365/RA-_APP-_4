import { tendersService } from '../tendersService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    TENDERS: '/tenders',
    TENDERS_DETAIL: (id) => `/tenders/${id}`,
  },
}));

describe('tendersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenders', () => {
    it('fetches tenders successfully', async () => {
      const mockTenders = {
        data: [
          { id: 1, title: 'Tender 1', status: 'open' },
          { id: 2, title: 'Tender 2', status: 'closed' },
        ],
      };

      ApiClient.get.mockResolvedValue(mockTenders);

      const result = await tendersService.getTenders();

      expect(ApiClient.get).toHaveBeenCalledWith('/tenders?published=true');
      expect(result).toEqual(mockTenders.data);
    });

    it('fetches tenders with status filter', async () => {
      const mockTenders = { data: [] };
      ApiClient.get.mockResolvedValue(mockTenders);

      await tendersService.getTenders({ status: 'open' });

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=open')
      );
    });

    it('handles API errors', async () => {
      const error = new Error('Network error');
      ApiClient.get.mockRejectedValue(error);

      await expect(tendersService.getTenders()).rejects.toThrow('Network error');
    });
  });

  describe('getTenderDetail', () => {
    it('fetches tender detail successfully', async () => {
      const mockTender = {
        data: { id: 1, title: 'Tender Detail', pdfUrl: 'http://example.com/tender.pdf' },
      };

      ApiClient.get.mockResolvedValue(mockTender);

      const result = await tendersService.getTenderDetail(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/tenders/1');
      expect(result).toEqual(mockTender.data);
    });
  });

  describe('searchTenders', () => {
    it('searches tenders with query', async () => {
      const mockTenders = { data: [] };
      ApiClient.get.mockResolvedValue(mockTenders);

      await tendersService.searchTenders('construction');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=construction')
      );
    });
  });

  describe('getTendersByStatus', () => {
    it('fetches tenders by status', async () => {
      const mockTenders = { data: [] };
      ApiClient.get.mockResolvedValue(mockTenders);

      await tendersService.getTendersByStatus('upcoming');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=upcoming')
      );
    });
  });
});
