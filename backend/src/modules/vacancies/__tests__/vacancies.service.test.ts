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

import { vacanciesService } from '../vacancies.service';
import { VacancyModel } from '../vacancies.model';

jest.mock('../vacancies.model');
jest.mock('../../../utils/logger');

describe('VacanciesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVacancy', () => {
    it('should create a vacancy successfully', async () => {
      const mockVacancy = {
        _id: 'vacancy123',
        title: 'Software Engineer',
        type: 'full-time',
        department: 'IT',
        location: 'Windhoek',
        description: 'Test description',
        requirements: ['Degree in CS'],
        responsibilities: ['Develop software'],
        closingDate: new Date('2024-12-31'),
        published: false,
      };

      (VacancyModel.create as jest.Mock).mockResolvedValue(mockVacancy);

      const result = await vacanciesService.createVacancy({
        title: 'Software Engineer',
        type: 'full-time',
        department: 'IT',
        location: 'Windhoek',
        description: 'Test description',
        requirements: ['Degree in CS'],
        responsibilities: ['Develop software'],
        closingDate: new Date('2024-12-31'),
      });

      expect(result).toEqual(mockVacancy);
      expect(VacancyModel.create).toHaveBeenCalled();
    });

    it('should throw error if creation fails', async () => {
      (VacancyModel.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(
        vacanciesService.createVacancy({
          title: 'Software Engineer',
          type: 'full-time',
          department: 'IT',
          location: 'Windhoek',
          description: 'Test description',
          requirements: ['Degree in CS'],
          responsibilities: ['Develop software'],
          closingDate: new Date('2024-12-31'),
        })
      ).rejects.toMatchObject({
        statusCode: 500,
        message: 'Failed to create vacancy',
      });
    });
  });

  describe('listVacancies', () => {
    it('should list vacancies with pagination', async () => {
      const mockVacancies = [
        { _id: '1', title: 'Vacancy 1', type: 'full-time' },
        { _id: '2', title: 'Vacancy 2', type: 'part-time' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockVacancies),
      };

      (VacancyModel.find as jest.Mock).mockReturnValue(mockQuery);
      (VacancyModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await vacanciesService.listVacancies({ page: 1, limit: 10 });

      expect(result.vacancies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by type', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (VacancyModel.find as jest.Mock).mockReturnValue(mockQuery);
      (VacancyModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await vacanciesService.listVacancies({ type: 'internship' });

      expect(VacancyModel.find).toHaveBeenCalledWith({ type: 'internship' });
    });

    it('should filter by department', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (VacancyModel.find as jest.Mock).mockReturnValue(mockQuery);
      (VacancyModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await vacanciesService.listVacancies({ department: 'IT' });

      expect(VacancyModel.find).toHaveBeenCalledWith({ department: 'IT' });
    });
  });

  describe('getVacancyById', () => {
    it('should return vacancy by ID', async () => {
      const mockVacancy = {
        _id: 'vacancy123',
        title: 'Software Engineer',
        type: 'full-time',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockVacancy),
      };

      (VacancyModel.findById as jest.Mock).mockReturnValue(mockQuery);

      const result = await vacanciesService.getVacancyById('vacancy123');

      expect(result).toEqual(mockVacancy);
      expect(VacancyModel.findById).toHaveBeenCalledWith('vacancy123');
    });

    it('should throw 404 if vacancy not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (VacancyModel.findById as jest.Mock).mockReturnValue(mockQuery);

      await expect(vacanciesService.getVacancyById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Vacancy not found',
      });
    });
  });

  describe('updateVacancy', () => {
    it('should update vacancy successfully', async () => {
      const mockUpdatedVacancy = {
        _id: 'vacancy123',
        title: 'Updated Title',
        type: 'full-time',
      };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUpdatedVacancy),
      };

      (VacancyModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      const result = await vacanciesService.updateVacancy('vacancy123', {
        title: 'Updated Title',
      });

      expect(result).toEqual(mockUpdatedVacancy);
    });

    it('should throw 404 if vacancy not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };

      (VacancyModel.findByIdAndUpdate as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        vacanciesService.updateVacancy('nonexistent', { title: 'Updated' })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Vacancy not found',
      });
    });
  });

  describe('deleteVacancy', () => {
    it('should delete vacancy successfully', async () => {
      const mockVacancy = { _id: 'vacancy123', title: 'Software Engineer' };

      (VacancyModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockVacancy);

      await vacanciesService.deleteVacancy('vacancy123');

      expect(VacancyModel.findByIdAndDelete).toHaveBeenCalledWith('vacancy123');
    });

    it('should throw 404 if vacancy not found', async () => {
      (VacancyModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(vacanciesService.deleteVacancy('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Vacancy not found',
      });
    });
  });
});
