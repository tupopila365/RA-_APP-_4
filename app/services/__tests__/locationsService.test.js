import { locationsService } from '../locationsService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    LOCATIONS: '/locations',
  },
}));

describe('locationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocations', () => {
    it('fetches locations successfully', async () => {
      const mockLocations = {
        data: [
          { id: 1, name: 'Windhoek Office', region: 'Khomas' },
          { id: 2, name: 'Swakopmund Office', region: 'Erongo' },
        ],
      };

      ApiClient.get.mockResolvedValue(mockLocations);

      const result = await locationsService.getLocations();

      expect(ApiClient.get).toHaveBeenCalledWith('/locations');
      expect(result).toEqual(mockLocations.data);
    });

    it('fetches locations with region filter', async () => {
      const mockLocations = { data: [] };
      ApiClient.get.mockResolvedValue(mockLocations);

      await locationsService.getLocations({ region: 'Khomas' });

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('region=Khomas')
      );
    });

    it('handles API errors', async () => {
      const error = new Error('Network error');
      ApiClient.get.mockRejectedValue(error);

      await expect(locationsService.getLocations()).rejects.toThrow('Network error');
    });
  });

  describe('getLocationsByRegion', () => {
    it('fetches locations by region', async () => {
      const mockLocations = { data: [] };
      ApiClient.get.mockResolvedValue(mockLocations);

      await locationsService.getLocationsByRegion('Erongo');

      expect(ApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('region=Erongo')
      );
    });
  });
});
