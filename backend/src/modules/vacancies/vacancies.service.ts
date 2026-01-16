import { VacancyModel, IVacancy } from './vacancies.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateVacancyDTO {
  title: string;
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: Date;
  pdfUrl?: string;
  published?: boolean;
  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactTelephone?: string;
  submissionLink?: string;
  submissionEmail?: string;
  submissionInstructions?: string;
}

export interface UpdateVacancyDTO {
  title?: string;
  type?: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  salary?: string;
  closingDate?: Date;
  pdfUrl?: string;
  published?: boolean;
}

export interface ListVacanciesQuery {
  page?: number;
  limit?: number;
  type?: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department?: string;
  location?: string;
  published?: boolean;
  search?: string;
}

export interface ListVacanciesResult {
  vacancies: IVacancy[];
  total: number;
  page: number;
  totalPages: number;
}

class VacanciesService {
  /**
   * Create a new vacancy
   */
  async createVacancy(dto: CreateVacancyDTO): Promise<IVacancy> {
    try {
      logger.info('Creating vacancy:', { title: dto.title });

      const vacancy = await VacancyModel.create({
        title: dto.title,
        type: dto.type,
        department: dto.department,
        location: dto.location,
        description: dto.description,
        requirements: dto.requirements,
        responsibilities: dto.responsibilities,
        salary: dto.salary,
        closingDate: dto.closingDate,
        pdfUrl: dto.pdfUrl,
        published: dto.published || false,
      });

      logger.info(`Vacancy created with ID: ${vacancy._id}`);
      return vacancy;
    } catch (error: any) {
      logger.error('Create vacancy error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create vacancy',
        details: error.message,
      };
    }
  }

  /**
   * List vacancies with pagination, filtering, and search
   */
  async listVacancies(query: ListVacanciesQuery): Promise<ListVacanciesResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.type) {
        filter.type = query.type;
      }

      if (query.department) {
        filter.department = query.department;
      }

      if (query.location) {
        filter.location = query.location;
      }

      if (query.published !== undefined) {
        filter.published = query.published;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [vacancies, total] = await Promise.all([
        VacancyModel.find(filter)
          .sort({ closingDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        VacancyModel.countDocuments(filter),
      ]);

      return {
        vacancies: vacancies as unknown as IVacancy[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List vacancies error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve vacancies',
        details: error.message,
      };
    }
  }

  /**
   * Get a single vacancy by ID
   */
  async getVacancyById(vacancyId: string): Promise<IVacancy> {
    try {
      const vacancy = await VacancyModel.findById(vacancyId).lean();

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      return vacancy as unknown as IVacancy;
    } catch (error: any) {
      logger.error('Get vacancy error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve vacancy',
        details: error.message,
      };
    }
  }

  /**
   * Update a vacancy
   */
  async updateVacancy(vacancyId: string, dto: UpdateVacancyDTO): Promise<IVacancy> {
    try {
      logger.info(`Updating vacancy: ${vacancyId}`);

      const vacancy = await VacancyModel.findByIdAndUpdate(
        vacancyId,
        dto,
        { new: true, runValidators: true }
      ).lean();

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      logger.info(`Vacancy ${vacancyId} updated successfully`);
      return vacancy as unknown as IVacancy;
    } catch (error: any) {
      logger.error('Update vacancy error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update vacancy',
        details: error.message,
      };
    }
  }

  /**
   * Delete a vacancy
   */
  async deleteVacancy(vacancyId: string): Promise<void> {
    try {
      logger.info(`Deleting vacancy: ${vacancyId}`);

      const vacancy = await VacancyModel.findByIdAndDelete(vacancyId);

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      logger.info(`Vacancy ${vacancyId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete vacancy error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete vacancy',
        details: error.message,
      };
    }
  }
}

export const vacanciesService = new VacanciesService();
