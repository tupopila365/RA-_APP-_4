import { AppDataSource } from '../../config/db';
import { Feedback } from './feedback.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateFeedbackDTO {
  category: string;
  message: string;
  email?: string;
}

export interface UpdateFeedbackDTO {
  status?: string;
  adminNotes?: string;
}

export interface ListFeedbackQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export interface ListFeedbackResult {
  feedback: Feedback[];
  total: number;
  page: number;
  totalPages: number;
}

class FeedbackService {
  async create(dto: CreateFeedbackDTO): Promise<Feedback> {
    try {
      const repo = AppDataSource.getRepository(Feedback);
      const item = repo.create({
        category: dto.category,
        message: dto.message,
        email: dto.email ?? null,
        status: 'new',
      });
      await repo.save(item);
      logger.info(`Feedback created: ${item.id}`);
      return item;
    } catch (error: any) {
      logger.error('Create feedback error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to submit feedback',
        details: error.message,
      };
    }
  }

  async list(query: ListFeedbackQuery): Promise<ListFeedbackResult> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 20));
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(Feedback);

      const qb = repo
        .createQueryBuilder('f')
        .orderBy('f.createdAt', 'DESC');

      if (query.category) {
        qb.andWhere('f.category = :category', { category: query.category });
      }
      if (query.status) {
        qb.andWhere('f.status = :status', { status: query.status });
      }
      if (query.search && query.search.trim()) {
        const term = `%${query.search.trim()}%`;
        qb.andWhere(
          '(f.message LIKE :term OR f.email LIKE :term OR f.category LIKE :term)',
          { term }
        );
      }

      const [feedback, total] = await Promise.all([
        qb.clone().skip(skip).take(limit).getMany(),
        qb.getCount(),
      ]);

      return {
        feedback,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List feedback error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to list feedback',
        details: error.message,
      };
    }
  }

  async getById(id: number): Promise<Feedback> {
    const repo = AppDataSource.getRepository(Feedback);
    const item = await repo.findOne({ where: { id } });
    if (!item) {
      throw {
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND,
        message: 'Feedback not found',
      };
    }
    return item;
  }

  async update(id: number, dto: UpdateFeedbackDTO): Promise<Feedback> {
    const repo = AppDataSource.getRepository(Feedback);
    const item = await repo.findOne({ where: { id } });
    if (!item) {
      throw {
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND,
        message: 'Feedback not found',
      };
    }
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.adminNotes !== undefined) item.adminNotes = dto.adminNotes;
    await repo.save(item);
    logger.info(`Feedback ${id} updated`);
    return item;
  }
}

export const feedbackService = new FeedbackService();
