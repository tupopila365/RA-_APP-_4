// Set up environment variables before imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.RAG_SERVICE_URL = 'http://localhost:8000';
process.env.CORS_ORIGIN = 'http://localhost:3001';

import { locationsService } from '../locations.service';
import { LocationModel } from '../locations.model';

jest.mock('../locations.model');
jest.mock('../../../utils/logger');

describe('LocationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLocation', () => {
    it('should create a location successfully', async () => {
      const mockLocation = {
        _id: 'location123',
        name: 'Windhoek Office',
        address: '123 Main Street',
        region: 'Khomas',
        coordinates: { latitude: -22.5609, longitude: 17.0658 },
        contactNumber: '+264 61 123456',
        email: 'windhoek@ra.gov.na',
      };

      (LocationModel.create as jest.Mock).mockResolvedValue(mockLocation);

      const result = await locationsService.createLocation({
        name: 'Windhoek Office',
        address: '123 Main Street',
        region: 'Khomas',
        coordinates: { latitude: -22.5609, longitude: 17.0658 },
        contactNumber: '+264 61 123456',
        email: 'windhoek@ra.gov.na',
      });

      expect(result).toEqual(mockLocation);
      expect(LocationModel.create).toHaveBeenCalled();
    });
  });

  describe('listLocations', () => {
    it('should list all locations', async () => {
      const mockLocations = [
        { _id: '1', name: 'Windhoek Office', region: 'Khomas' },
        { _id: '2', name: 'Walvis Bay Office', region: 'Erongo' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLocations),
      };

      (LocationModel.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await locationsService.listLocations();

      expect(result).toHaveLength(2);
      expect(LocationModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by region', async () => {
      const mockLocations = [
        { _id: '1', name: 'Windhoek Office', region: 'Khomas' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLocations),
      };

      (LocationModel.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await locationsService.listLocations({ region: 'Khomas' });

      expect(result).toHaveLength(1);
      expect(LocationModel.find).toHaveBeenCalledWith({ region: 'Khomas' });
    });
  });

  describe('getLocationById', () => {
    it('should return location by ID', async () => {
      const mockLocation = {
        _id: 'location123',
        name: 'Windhoek Office',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockLocation),
      };

      (LocationModel.findById as jest.Mock).mockReturnValue(mockQuery);

      const result = await locationsService.getLocationById('location123');

      expect(result).toEqual(mockLocation);
    });

    it('should throw 404 if location not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (LocationModel.findById as jest.Mock).mockReturnValue(mockQuery);

      await expect(locationsService.getLocationById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Location not found',
      });
    });
  });

  describe('updateLocation', () => {
    it('should update location successfully', async () => {
      const mockUpdatedLocation = {
        _id: 'location123',
        name: 'Updated Office',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUpdatedLocation),
      };

      (LocationModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      const result = await locationsService.updateLocation('location123', {
        name: 'Updated Office',
      });

      expect(result).toEqual(mockUpdatedLocation);
    });

    it('should throw 404 if location not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (LocationModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        locationsService.updateLocation('nonexistent', { name: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Location not found',
      });
    });
  });

  describe('deleteLocation', () => {
    it('should delete location successfully', async () => {
      const mockLocation = { _id: 'location123', name: 'Windhoek Office' };

      (LocationModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockLocation);

      await locationsService.deleteLocation('location123');

      expect(LocationModel.findByIdAndDelete).toHaveBeenCalledWith('location123');
    });

    it('should throw 404 if location not found', async () => {
      (LocationModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(locationsService.deleteLocation('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Location not found',
      });
    });
  });
});
