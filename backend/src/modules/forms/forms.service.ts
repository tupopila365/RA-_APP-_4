import { AppDataSource } from '../../config/db';
import { Form } from './forms.entity';
import { logger } from '../../utils/logger';
import { AppError } from '../../middlewares/errorHandler';
import { ERROR_CODES } from '../../constants/errors';

export class FormService {
  async createForm(
    data: {
      name: string;
      category: string;
      documents: Array<{ title: string; url: string; fileName: string }>;
      published?: boolean;
    },
    userId?: string
  ): Promise<Form> {
    try {
      const repo = AppDataSource.getRepository(Form);
      const form = repo.create({
        ...data,
        category: data.category as Form['category'],
        createdBy: userId ?? null,
      });
      await repo.save(form);
      logger.info(`Form created: ${form.id}`);
      return form;
    } catch (error: any) {
      logger.error('Create form error:', error);
      if (error.number === 2627) {
        throw { message: 'Form with this name already exists', statusCode: 409, code: ERROR_CODES.DUPLICATE_ERROR };
      }
      throw error;
    }
  }

  async listForms(options: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }): Promise<{ items: Form[]; total: number; page: number; totalPages: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(Form);

      const buildQb = () => {
        const qb = repo.createQueryBuilder('f');
        if (options.category) qb.andWhere('f.category = :category', { category: options.category });
        if (options.published !== undefined) qb.andWhere('f.published = :published', { published: options.published });
        if (options.search) qb.andWhere('f.name LIKE :search', { search: `%${options.search}%` });
        return qb;
      };

      const [items, total] = await Promise.all([
        buildQb().orderBy('f.createdAt', 'DESC').skip(skip).take(limit).getMany(),
        buildQb().getCount(),
      ]);

      return { items, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      logger.error('List forms error:', error);
      throw error;
    }
  }

  async getFormById(id: string): Promise<Form> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(Form);
      const form = await repo.findOne({ where: { id: idNum } });
      if (!form) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Form not found' };
      }
      return form;
    } catch (error: any) {
      logger.error('Get form error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
      }
      throw error;
    }
  }

  async updateForm(id: string, data: Partial<Form>): Promise<Form> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(Form);
      const form = await repo.findOne({ where: { id: idNum } });
      if (!form) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Form not found' };
      }
      Object.assign(form, data);
      await repo.save(form);
      logger.info(`Form updated: ${id}`);
      return form;
    } catch (error: any) {
      logger.error('Update form error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
      }
      throw error;
    }
  }

  async deleteForm(id: string): Promise<void> {
    try {
      const idNum = parseInt(id, 10);
      const repo = AppDataSource.getRepository(Form);
      const form = await repo.findOne({ where: { id: idNum } });
      if (!form) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Form not found' };
      }
      await repo.remove(form);
      logger.info(`Form deleted: ${id}`);
    } catch (error: any) {
      logger.error('Delete form error:', error);
      if (error.statusCode) throw error;
      if (isNaN(parseInt(id, 10))) {
        throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
      }
      throw error;
    }
  }
}

export const formService = new FormService();
