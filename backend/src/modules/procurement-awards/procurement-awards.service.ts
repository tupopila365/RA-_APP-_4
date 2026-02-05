import { AppDataSource } from '../../config/db';
import { ProcurementAward } from './procurement-awards.entity';
import type { IProcurementAward } from './procurement-awards.model';
import {
  CreateProcurementAwardDTO,
  UpdateProcurementAwardDTO,
  ListProcurementAwardQuery,
} from './procurement-awards.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface ListProcurementAwardResult {
  items: ProcurementAward[];
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
      message: 'Procurement award not found',
    };
  }
  return num;
}

class ProcurementAwardService {
  async createAward(dto: CreateProcurementAwardDTO, createdBy?: string): Promise<ProcurementAward> {
    try {
      logger.info('Creating procurement award:', {
        procurementReference: dto.procurementReference,
        type: dto.type,
      });

      const repo = AppDataSource.getRepository(ProcurementAward);
      const award = repo.create({
        type: dto.type,
        procurementReference: dto.procurementReference,
        description: dto.description,
        executiveSummary: dto.executiveSummary,
        successfulBidder: dto.successfulBidder,
        dateAwarded: dto.dateAwarded,
        published: dto.published || false,
        createdBy: createdBy ?? null,
      });

      const saved = await repo.save(award);
      logger.info(`Procurement award created with ID: ${saved.id}`);
      return saved;
    } catch (error: any) {
      logger.error('Create procurement award error:', error);
      if (error.number === 2627) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement reference already exists',
          details: error.message,
        };
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create procurement award',
        details: error.message,
      };
    }
  }

  async listAwards(query: ListProcurementAwardQuery): Promise<ListProcurementAwardResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      const repo = AppDataSource.getRepository(ProcurementAward);
      const qb = repo.createQueryBuilder('p');

      if (query.type) qb.andWhere('p.type = :type', { type: query.type });
      if (query.published !== undefined) qb.andWhere('p.published = :published', { published: query.published });
      if (query.search) {
        qb.andWhere(
          '(p.procurementReference LIKE :search OR p.description LIKE :search OR p.successfulBidder LIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      const [items, total] = await qb
        .orderBy('p.dateAwarded', 'DESC')
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
      logger.error('List procurement awards error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement awards',
        details: error.message,
      };
    }
  }

  async getAwardById(id: string): Promise<ProcurementAward> {
    try {
      const numId = parseId(id);
      const award = await AppDataSource.getRepository(ProcurementAward).findOne({
        where: { id: numId },
      });

      if (!award) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement award not found',
        };
      }

      return award;
    } catch (error: any) {
      logger.error('Get procurement award error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement award',
        details: error.message,
      };
    }
  }

  async updateAward(id: string, dto: UpdateProcurementAwardDTO): Promise<ProcurementAward> {
    try {
      logger.info(`Updating procurement award: ${id}`);

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(ProcurementAward);
      const existing = await repo.findOne({ where: { id: numId } });

      if (!existing) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement award not found',
        };
      }

      if (dto.type !== undefined) existing.type = dto.type;
      if (dto.procurementReference !== undefined) existing.procurementReference = dto.procurementReference;
      if (dto.description !== undefined) existing.description = dto.description;
      if (dto.executiveSummary !== undefined) existing.executiveSummary = dto.executiveSummary;
      if (dto.successfulBidder !== undefined) existing.successfulBidder = dto.successfulBidder;
      if (dto.dateAwarded !== undefined) existing.dateAwarded = dto.dateAwarded;
      if (dto.published === true && !existing.published && !existing.publishedAt) {
        existing.publishedAt = new Date();
      }
      if (dto.published !== undefined) existing.published = dto.published;

      const award = await repo.save(existing);
      logger.info(`Procurement award ${id} updated successfully`);
      return award;
    } catch (error: any) {
      logger.error('Update procurement award error:', error);
      if (error.statusCode) throw error;
      if (error.number === 2627) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement reference already exists',
          details: error.message,
        };
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update procurement award',
        details: error.message,
      };
    }
  }

  async deleteAward(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        logger.error('Delete called with invalid ID:', id);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement award ID is required',
        };
      }

      logger.info(`Deleting procurement award: ${id}`);

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(ProcurementAward);
      const award = await repo.findOne({ where: { id: numId } });

      if (!award) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement award not found',
        };
      }

      await repo.remove(award);
      logger.info(`Procurement award ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete procurement award error:', { id, error: error.message });
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete procurement award',
        details: error.message,
      };
    }
  }
}

export const procurementAwardService = new ProcurementAwardService();
