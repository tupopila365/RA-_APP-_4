import { AppDataSource } from '../../config/db';
import { ProcurementLegislation } from './procurement-legislation.entity';
import type { IProcurementLegislation } from './procurement-legislation.model';
import {
  CreateProcurementLegislationDTO,
  UpdateProcurementLegislationDTO,
  ListProcurementLegislationQuery,
} from './procurement-legislation.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface ListProcurementLegislationResult {
  items: ProcurementLegislation[];
  total: number;
  page: number;
  totalPages: number;
}

function parseId(id: string): number {
  const num = parseInt(id, 10);
  if (isNaN(num)) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Procurement legislation not found',
    };
  }
  return num;
}

class ProcurementLegislationService {
  async createLegislation(
    dto: CreateProcurementLegislationDTO,
    createdBy?: string
  ): Promise<ProcurementLegislation> {
    try {
      logger.info('Creating procurement legislation:', { title: dto.title, section: dto.section });

      const repo = AppDataSource.getRepository(ProcurementLegislation);
      const legislation = repo.create({
        section: dto.section,
        title: dto.title,
        documentUrl: dto.documentUrl,
        documentFileName: dto.documentFileName,
        published: dto.published || false,
        createdBy: createdBy ?? null,
      });

      const saved = await repo.save(legislation);
      logger.info(`Procurement legislation created with ID: ${saved.id}`);
      return saved;
    } catch (error: any) {
      logger.error('Create procurement legislation error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create procurement legislation',
        details: error.message,
      };
    }
  }

  async listLegislation(query: ListProcurementLegislationQuery): Promise<ListProcurementLegislationResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      const repo = AppDataSource.getRepository(ProcurementLegislation);
      const qb = repo.createQueryBuilder('p');

      if (query.section) qb.andWhere('p.section = :section', { section: query.section });
      if (query.published !== undefined) qb.andWhere('p.published = :published', { published: query.published });
      if (query.search) {
        qb.andWhere('(p.title LIKE :search OR p.section LIKE :search)', { search: `%${query.search}%` });
      }

      const [items, total] = await qb
        .orderBy('p.publishedAt', 'DESC')
        .addOrderBy('p.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List procurement legislation error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement legislation',
        details: error.message,
      };
    }
  }

  async getLegislationById(id: string): Promise<ProcurementLegislation> {
    try {
      const numId = parseId(id);
      const legislation = await AppDataSource.getRepository(ProcurementLegislation).findOne({
        where: { id: numId },
      });

      if (!legislation) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      return legislation;
    } catch (error: any) {
      logger.error('Get procurement legislation error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement legislation',
        details: error.message,
      };
    }
  }

  async updateLegislation(
    id: string,
    dto: UpdateProcurementLegislationDTO
  ): Promise<ProcurementLegislation> {
    try {
      logger.info(`Updating procurement legislation: ${id}`);

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(ProcurementLegislation);
      const existing = await repo.findOne({ where: { id: numId } });

      if (!existing) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      if (dto.section !== undefined) existing.section = dto.section;
      if (dto.title !== undefined) existing.title = dto.title;
      if (dto.documentUrl !== undefined) existing.documentUrl = dto.documentUrl;
      if (dto.documentFileName !== undefined) existing.documentFileName = dto.documentFileName;
      if (dto.published === true && !existing.published && !existing.publishedAt) {
        existing.publishedAt = new Date();
      }
      if (dto.published !== undefined) existing.published = dto.published;

      const legislation = await repo.save(existing);
      logger.info(`Procurement legislation ${id} updated successfully`);
      return legislation;
    } catch (error: any) {
      logger.error('Update procurement legislation error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update procurement legislation',
        details: error.message,
      };
    }
  }

  async deleteLegislation(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        logger.error('Delete called with invalid ID:', id);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement legislation ID is required',
        };
      }

      logger.info(`Deleting procurement legislation: ${id}`);

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(ProcurementLegislation);
      const legislation = await repo.findOne({ where: { id: numId } });

      if (!legislation) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      await repo.remove(legislation);
      logger.info(`Procurement legislation ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete procurement legislation error:', { id, error: error.message });
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete procurement legislation',
        details: error.message,
      };
    }
  }
}

export const procurementLegislationService = new ProcurementLegislationService();
