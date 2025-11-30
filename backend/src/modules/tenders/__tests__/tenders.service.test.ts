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

import { tendersService } from '../tenders.service';
import { TenderModel } from '../tenders.model';

jest.mock('../tenders.model');
jest.mock('../../../utils/logger');

describe('TendersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTender', () => {
    it('should create a tender successfully', async () => {
      const mockTender = {
        _id: 'tender123',
        referenceNumber: 'TND-2024-001',
        title: 'Road Construction',
        description: 'Test description',
        category: 'construction',
        status: 'open',
        openingDate: new Date('2024-01-01'),
        closingDate: new Date('2024-12-31'),
        pdfUrl: 'http://example.com/tender.pdf',
        published: false,
      };

      (TenderModel.create as jest.Mock).mockResolvedValue(mockTender);

      const result = await tendersService.createTender({
        referenceNumber: 'TND-2024-001',
        title: 'Road Construction',
        description: 'Test description',
        category: 'construction',
        status: 'open',
        openingDate: new Date('2024-01-01'),
        closingDate: new Date('2024-12-31'),
        pdfUrl: 'http://example.com/tender.pdf',
      });

      expect(result).toEqual(mockTender);
      expect(TenderModel.create).toHaveBeenCalled();
    });

    it('should throw error for duplicate reference number', async () => {
      const error: any = new Error('Duplicate key');
      error.code = 11000;
      (TenderModel.create as jest.Mock).mockRejectedValue(error);

      await expect(
        tendersService.createTender({
          referenceNumber: 'TND-2024-001',
          title: 'Road Construction',
          description: 'Test description',
          category: 'construction',
          status: 'open',
          openingDate: new Date('2024-01-01'),
          closingDate: new Date('2024-12-31'),
          pdfUrl: 'http://example.com/tender.pdf',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'A tender with this reference number already exists',
      });
    });
  });

  describe('listTenders', () => {
    it('should list tenders with pagination', async () => {
      const mockTenders = [
        { _id: '1', title: 'Tender 1', status: 'open' },
        { _id: '2', title: 'Tender 2', status: 'closed' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTenders),
      };

      (TenderModel.find as jest.Mock).mockReturnValue(mockQuery);
      (TenderModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await tendersService.listTenders({ page: 1, limit: 10 });

      expect(result.tenders).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (TenderModel.find as jest.Mock).mockReturnValue(mockQuery);
      (TenderModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await tendersService.listTenders({ status: 'open' });

      expect(TenderModel.find).toHaveBeenCalledWith({ status: 'open' });
    });
  });

  describe('getTenderById', () => {
    it('should return tender by ID', async () => {
      const mockTender = {
        _id: 'tender123',
        title: 'Road Construction',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockTender),
      };

      (TenderModel.findById as jest.Mock).mockReturnValue(mockQuery);

      const result = await tendersService.getTenderById('tender123');

      expect(result).toEqual(mockTender);
    });

    it('should throw 404 if tender not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (TenderModel.findById as jest.Mock).mockReturnValue(mockQuery);

      await expect(tendersService.getTenderById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Tender not found',
      });
    });
  });

  describe('updateTender', () => {
    it('should update tender successfully', async () => {
      const mockUpdatedTender = {
        _id: 'tender123',
        title: 'Updated Title',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUpdatedTender),
      };

      (TenderModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      const result = await tendersService.updateTender('tender123', {
        title: 'Updated Title',
      });

      expect(result).toEqual(mockUpdatedTender);
    });

    it('should throw 404 if tender not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (TenderModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        tendersService.updateTender('nonexistent', { title: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Tender not found',
      });
    });
  });

  describe('deleteTender', () => {
    it('should delete tender successfully', async () => {
      const mockTender = { _id: 'tender123', title: 'Road Construction' };

      (TenderModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockTender);

      await tendersService.deleteTender('tender123');

      expect(TenderModel.findByIdAndDelete).toHaveBeenCalledWith('tender123');
    });

    it('should throw 404 if tender not found', async () => {
      (TenderModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(tendersService.deleteTender('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Tender not found',
      });
    });
  });
});
