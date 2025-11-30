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

import { bannersService } from '../banners.service';
import { BannerModel } from '../banners.model';

jest.mock('../banners.model');
jest.mock('../../../utils/logger');

describe('BannersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBanner', () => {
    it('should create a banner successfully', async () => {
      const mockBanner = {
        _id: 'banner123',
        title: 'Welcome Banner',
        description: 'Test description',
        imageUrl: 'http://example.com/banner.jpg',
        linkUrl: 'http://example.com',
        order: 0,
        active: true,
      };

      (BannerModel.create as jest.Mock).mockResolvedValue(mockBanner);

      const result = await bannersService.createBanner({
        title: 'Welcome Banner',
        description: 'Test description',
        imageUrl: 'http://example.com/banner.jpg',
        linkUrl: 'http://example.com',
      });

      expect(result).toEqual(mockBanner);
      expect(BannerModel.create).toHaveBeenCalled();
    });
  });

  describe('listBanners', () => {
    it('should list all banners', async () => {
      const mockBanners = [
        { _id: '1', title: 'Banner 1', active: true, order: 1 },
        { _id: '2', title: 'Banner 2', active: false, order: 2 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBanners),
      };

      (BannerModel.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await bannersService.listBanners();

      expect(result).toHaveLength(2);
      expect(BannerModel.find).toHaveBeenCalledWith({});
    });

    it('should filter active banners only', async () => {
      const mockBanners = [
        { _id: '1', title: 'Banner 1', active: true, order: 1 },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBanners),
      };

      (BannerModel.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await bannersService.listBanners({ activeOnly: true });

      expect(result).toHaveLength(1);
      expect(BannerModel.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('getBannerById', () => {
    it('should return banner by ID', async () => {
      const mockBanner = {
        _id: 'banner123',
        title: 'Welcome Banner',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockBanner),
      };

      (BannerModel.findById as jest.Mock).mockReturnValue(mockQuery);

      const result = await bannersService.getBannerById('banner123');

      expect(result).toEqual(mockBanner);
    });

    it('should throw 404 if banner not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (BannerModel.findById as jest.Mock).mockReturnValue(mockQuery);

      await expect(bannersService.getBannerById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Banner not found',
      });
    });
  });

  describe('updateBanner', () => {
    it('should update banner successfully', async () => {
      const mockUpdatedBanner = {
        _id: 'banner123',
        title: 'Updated Title',
        active: false,
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUpdatedBanner),
      };

      (BannerModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      const result = await bannersService.updateBanner('banner123', {
        title: 'Updated Title',
        active: false,
      });

      expect(result).toEqual(mockUpdatedBanner);
    });

    it('should throw 404 if banner not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (BannerModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        bannersService.updateBanner('nonexistent', { title: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Banner not found',
      });
    });
  });

  describe('deleteBanner', () => {
    it('should delete banner successfully', async () => {
      const mockBanner = { _id: 'banner123', title: 'Welcome Banner' };

      (BannerModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockBanner);

      await bannersService.deleteBanner('banner123');

      expect(BannerModel.findByIdAndDelete).toHaveBeenCalledWith('banner123');
    });

    it('should throw 404 if banner not found', async () => {
      (BannerModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(bannersService.deleteBanner('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Banner not found',
      });
    });
  });
});
