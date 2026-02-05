import { AppDataSource } from '../../config/db';
import { RAService } from './ra-services.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class RAServicesService {
  async createService(data: {
    name: string;
    description: string;
    requirements: string[];
    fee: string;
    ageRestriction?: string;
    category: string;
    imageUrl?: string;
    pdfs: Array<{ title: string; url: string; fileName: string }>;
    contactInfo?: string;
    published?: boolean;
    sortOrder?: number;
  }): Promise<RAService> {
    try {
      const repo = AppDataSource.getRepository(RAService);
      const service = repo.create({
        ...data,
        requirements: data.requirements || [],
        pdfs: data.pdfs || [],
        ageRestriction: data.ageRestriction || null,
        imageUrl: data.imageUrl || null,
        contactInfo: data.contactInfo || null,
        published: data.published === true,
        sortOrder: data.sortOrder ?? 0,
      });
      await repo.save(service);
      logger.info(`RA Service created: ${service.id}`);
      return service;
    } catch (error: any) {
      logger.error('Create RA service error:', error);
      if (error.number === 2627) {
        throw { message: 'Service with this name already exists', statusCode: 409, code: ERROR_CODES.DUPLICATE_ERROR };
      }
      throw error;
    }
  }

  async listServices(options: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }): Promise<{ items: RAService[]; total: number; page: number; totalPages: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(RAService);

      const buildQb = () => {
        const qb = repo.createQueryBuilder('s');
        if (options.category) qb.andWhere('s.category = :category', { category: options.category });
        if (options.published !== undefined) qb.andWhere('s.published = :published', { published: options.published });
        if (options.search) {
          qb.andWhere('(s.name LIKE :search OR s.description LIKE :search)', {
            search: `%${options.search}%`,
          });
        }
        return qb;
      };

      const [items, total] = await Promise.all([
        buildQb()
          .orderBy('s.sortOrder', 'ASC')
          .addOrderBy('s.createdAt', 'DESC')
          .skip(skip)
          .take(limit)
          .getMany(),
        buildQb().getCount(),
      ]);

      return { items, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      logger.error('List RA services error:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<RAService> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(RAService);
      const service = await repo.findOne({ where: { id: idNum } });
      if (!service) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'RA Service not found' };
      }
      return service;
    } catch (error: any) {
      logger.error('Get RA service error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid service ID' };
      }
      throw error;
    }
  }

  async updateService(id: string, data: Partial<RAService>): Promise<RAService> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(RAService);
      const service = await repo.findOne({ where: { id: idNum } });
      if (!service) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'RA Service not found' };
      }
      Object.assign(service, data);
      await repo.save(service);
      logger.info(`RA Service updated: ${id}`);
      return service;
    } catch (error: any) {
      logger.error('Update RA service error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid service ID' };
      }
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(RAService);
      const service = await repo.findOne({ where: { id: idNum } });
      if (!service) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'RA Service not found' };
      }
      await repo.remove(service);
      logger.info(`RA Service deleted: ${id}`);
    } catch (error: any) {
      logger.error('Delete RA service error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid service ID' };
      }
      throw error;
    }
  }
}

export const raServicesService = new RAServicesService();
