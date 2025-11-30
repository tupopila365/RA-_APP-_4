import { bannersService } from '../bannersService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    BANNERS: '/banners',
  },
}));

describe('bannersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBanners', () => {
    it('fetches banners successfully', async () => {
      const mockBanners = {
        data: [
          { id: 1, title: 'Banner 1', active: true, order: 1 },
          { id: 2, title: 'Banner 2', active: true, order: 2 },
        ],
      };

      ApiClient.get.mockResolvedValue(mockBanners);

      const result = await bannersService.getBanners();

      expect(ApiClient.get).toHaveBeenCalledWith('/banners');
      expect(result).toEqual(mockBanners.data);
    });

    it('handles API errors', async () => {
      const error = new Error('Network error');
      ApiClient.get.mockRejectedValue(error);

      await expect(bannersService.getBanners()).rejects.toThrow('Network error');
    });

    it('returns active banners only', async () => {
      const mockBanners = {
        data: [
          { id: 1, title: 'Active Banner', active: true },
        ],
      };

      ApiClient.get.mockResolvedValue(mockBanners);

      const result = await bannersService.getBanners();

      expect(result.every(banner => banner.active)).toBe(true);
    });
  });
});
