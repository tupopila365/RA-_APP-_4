import { AppDataSource } from '../../config/db';
import { Vacancy } from './vacancies.entity';
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
  vacancies: Vacancy[];
  total: number;
  page: number;
  totalPages: number;
}

class VacanciesService {
  async createVacancy(dto: CreateVacancyDTO): Promise<Vacancy> {
    try {
      logger.info('Creating vacancy:', { title: dto.title });
      const repo = AppDataSource.getRepository(Vacancy);
      const vacancy = repo.create({
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
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactTelephone: dto.contactTelephone,
        submissionLink: dto.submissionLink,
        submissionEmail: dto.submissionEmail,
        submissionInstructions: dto.submissionInstructions,
      });
      await repo.save(vacancy);
      logger.info(`Vacancy created with ID: ${vacancy.id}`);
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

  async listVacancies(query: ListVacanciesQuery): Promise<ListVacanciesResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(Vacancy);

      const where: any = {};
      if (query.type) where.type = query.type;
      if (query.department) where.department = query.department;
      if (query.location) where.location = query.location;
      if (query.published !== undefined) where.published = query.published;

      const buildQb = () => {
        const qb = repo.createQueryBuilder('v');
        if (query.type) qb.andWhere('v.type = :type', { type: query.type });
        if (query.department) qb.andWhere('v.department = :department', { department: query.department });
        if (query.location) qb.andWhere('v.location = :location', { location: query.location });
        if (query.published !== undefined) qb.andWhere('v.published = :published', { published: query.published });
        if (query.search) {
          qb.andWhere('(v.title LIKE :search OR v.description LIKE :search)', { search: `%${query.search}%` });
        }
        return qb;
      };

      const [vacancies, total] = await Promise.all([
        buildQb().orderBy('v.closingDate', 'ASC').addOrderBy('v.createdAt', 'DESC').skip(skip).take(limit).getMany(),
        buildQb().getCount(),
      ]);

      return {
        vacancies,
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

  async getVacancyById(vacancyId: string): Promise<Vacancy> {
    try {
      const id = parseInt(vacancyId, 10);
      const repo = AppDataSource.getRepository(Vacancy);
      const vacancy = await repo.findOne({ where: { id } });

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      return vacancy;
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

  async updateVacancy(vacancyId: string, dto: UpdateVacancyDTO): Promise<Vacancy> {
    try {
      logger.info(`Updating vacancy: ${vacancyId}`);
      const id = parseInt(vacancyId, 10);
      const repo = AppDataSource.getRepository(Vacancy);
      const vacancy = await repo.findOne({ where: { id } });

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      Object.assign(vacancy, dto);
      if (dto.closingDate) vacancy.closingDate = dto.closingDate;
      await repo.save(vacancy);

      logger.info(`Vacancy ${vacancyId} updated successfully`);
      return vacancy;
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

  async deleteVacancy(vacancyId: string): Promise<void> {
    try {
      logger.info(`Deleting vacancy: ${vacancyId}`);
      const id = parseInt(vacancyId, 10);
      const repo = AppDataSource.getRepository(Vacancy);
      const vacancy = await repo.findOne({ where: { id } });

      if (!vacancy) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Vacancy not found',
        };
      }

      await repo.remove(vacancy);
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
