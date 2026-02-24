import { AppDataSource } from '../../config/db';
import { FormDownload } from './forms.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class FormService {
  async create(data: {
    title: string;
    description?: string | null;
    category: string;
    pdfUrl: string;
    published?: boolean;
  }): Promise<FormDownload> {
    const repo = AppDataSource.getRepository(FormDownload);
    const entity = repo.create({
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      pdfUrl: data.pdfUrl,
      published: data.published !== false,
    });
    await repo.save(entity);
    logger.info(`Form download created: ${entity.id}`);
    return entity;
  }

  async list(options: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }): Promise<{ items: FormDownload[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 50, 100);
    const skip = (page - 1) * limit;
    const repo = AppDataSource.getRepository(FormDownload);

    const baseQb = () => {
      const q = repo.createQueryBuilder('f');
      if (options.category) q.andWhere('f.category = :category', { category: options.category });
      if (options.published !== undefined) q.andWhere('f.published = :published', { published: options.published });
      if (options.search) {
        q.andWhere('(f.title LIKE :search OR f.description LIKE :search)', {
          search: `%${options.search}%`,
        });
      }
      return q;
    };

    const [items, total] = await Promise.all([
      baseQb().orderBy('f.createdAt', 'DESC').skip(skip).take(limit).getMany(),
      baseQb().getCount(),
    ]);
    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string): Promise<FormDownload> {
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      throw { statusCode: 400, code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid form ID' };
    }
    const repo = AppDataSource.getRepository(FormDownload);
    const entity = await repo.findOne({ where: { id: idNum } });
    if (!entity) {
      throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Form not found' };
    }
    return entity;
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      category: string;
      pdfUrl: string;
      published: boolean;
    }>
  ): Promise<FormDownload> {
    const entity = await this.getById(id);
    const repo = AppDataSource.getRepository(FormDownload);
    if (data.title !== undefined) entity.title = data.title;
    if (data.description !== undefined) entity.description = data.description;
    if (data.category !== undefined) entity.category = data.category;
    if (data.pdfUrl !== undefined) entity.pdfUrl = data.pdfUrl;
    if (data.published !== undefined) entity.published = data.published;
    await repo.save(entity);
    logger.info(`Form download updated: ${id}`);
    return entity;
  }

  async delete(id: string): Promise<void> {
    const entity = await this.getById(id);
    const repo = AppDataSource.getRepository(FormDownload);
    await repo.remove(entity);
    logger.info(`Form download deleted: ${id}`);
  }
}

export const formService = new FormService();
