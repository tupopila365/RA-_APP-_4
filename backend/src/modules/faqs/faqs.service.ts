import { AppDataSource } from '../../config/db';
import { FAQ } from './faqs.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateFAQDTO {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface UpdateFAQDTO {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
}

export interface ListFAQsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface ListFAQsResult {
  faqs: FAQ[];
  total: number;
  page: number;
  totalPages: number;
}

class FAQService {
  async createFAQ(dto: CreateFAQDTO): Promise<FAQ> {
    try {
      logger.info('Creating FAQ:', { question: dto.question });
      const repo = AppDataSource.getRepository(FAQ);
      const faq = repo.create({
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        order: dto.order || 0,
      });
      await repo.save(faq);
      logger.info(`FAQ created with ID: ${faq.id}`);
      return faq;
    } catch (error: any) {
      logger.error('Create FAQ error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create FAQ',
        details: error.message,
      };
    }
  }

  async listFAQs(query: ListFAQsQuery): Promise<ListFAQsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(FAQ);

      const buildQb = () => {
        const qb = repo.createQueryBuilder('f');
        if (query.category) qb.andWhere('f.category = :category', { category: query.category });
        if (query.search) {
          qb.andWhere('(f.question LIKE :search OR f.answer LIKE :search)', { search: `%${query.search}%` });
        }
        return qb;
      };

      const [faqs, total] = await Promise.all([
        buildQb().orderBy('f.order', 'ASC').addOrderBy('f.createdAt', 'DESC').skip(skip).take(limit).getMany(),
        buildQb().getCount(),
      ]);

      return { faqs, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      logger.error('List FAQs error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve FAQs',
        details: error.message,
      };
    }
  }

  async getFAQById(faqId: string): Promise<FAQ> {
    try {
      const id = parseInt(faqId, 10);
      const repo = AppDataSource.getRepository(FAQ);
      const faq = await repo.findOne({ where: { id } });
      if (!faq) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
      }
      return faq;
    } catch (error: any) {
      logger.error('Get FAQ error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve FAQ',
        details: error.message,
      };
    }
  }

  async updateFAQ(faqId: string, dto: UpdateFAQDTO): Promise<FAQ> {
    try {
      logger.info(`Updating FAQ: ${faqId}`);
      const id = parseInt(faqId, 10);
      const repo = AppDataSource.getRepository(FAQ);
      const faq = await repo.findOne({ where: { id } });
      if (!faq) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
      }
      Object.assign(faq, dto);
      await repo.save(faq);
      logger.info(`FAQ ${faqId} updated successfully`);
      return faq;
    } catch (error: any) {
      logger.error('Update FAQ error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update FAQ',
        details: error.message,
      };
    }
  }

  async deleteFAQ(faqId: string): Promise<void> {
    try {
      if (!faqId || faqId === 'undefined' || faqId === 'null') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'FAQ ID is required',
        };
      }
      logger.info(`Deleting FAQ: ${faqId}`);
      const id = parseInt(faqId, 10);
      if (isNaN(id)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid FAQ ID format',
        };
      }
      const repo = AppDataSource.getRepository(FAQ);
      const faq = await repo.findOne({ where: { id } });
      if (!faq) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'FAQ not found' };
      }
      await repo.remove(faq);
      logger.info(`FAQ ${faqId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete FAQ error:', { faqId, error: (error as Error).message });
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete FAQ',
        details: error.message,
      };
    }
  }
}

export const faqsService = new FAQService();
