import { AppDataSource } from '../../config/db';
import { RoadStatus as RoadStatusEntity, RoadStatusStatus } from './road-status.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface RoadStatusDto {
  id: number;
  name: string;
  region: string;
  status: RoadStatusStatus;
  lat: number;
  lng: number;
  notes: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoadStatusDto {
  name: string;
  region: string;
  status: RoadStatusStatus;
  lat: number;
  lng: number;
  notes?: string | null;
  published?: boolean;
}

export interface UpdateRoadStatusDto {
  name?: string;
  region?: string;
  status?: RoadStatusStatus;
  lat?: number;
  lng?: number;
  notes?: string | null;
  published?: boolean;
}

export interface ListRoadStatusQuery {
  region?: string;
  status?: string;
  search?: string;
  published?: boolean;
  page?: number;
  limit?: number;
}

const VALID_STATUSES: RoadStatusStatus[] = ['open', 'caution', 'maintenance', 'closed'];

function toDto(row: RoadStatusEntity): RoadStatusDto {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    status: row.status as RoadStatusStatus,
    lat: row.lat,
    lng: row.lng,
    notes: row.notes,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class RoadStatusService {
  async listPublic(query?: string): Promise<RoadStatusDto[]> {
    try {
      const repo = AppDataSource.getRepository(RoadStatusEntity);
      const qb = repo
        .createQueryBuilder('r')
        .where('r.published = :published', { published: true });

      if (query && query.trim()) {
        const term = `%${query.trim()}%`;
        qb.andWhere(
          '(r.name LIKE :term OR r.region LIKE :term OR r.notes LIKE :term)',
          { term }
        );
      }

      const items = await qb
        .orderBy('r.region', 'ASC')
        .addOrderBy('r.name', 'ASC')
        .getMany();

      return items.map(toDto);
    } catch (error: any) {
      logger.error('List public road status error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve road status',
        details: error.message,
      };
    }
  }

  async list(query: ListRoadStatusQuery): Promise<{
    items: RoadStatusDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const repo = AppDataSource.getRepository(RoadStatusEntity);
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 20));
      const skip = (page - 1) * limit;

      let qb = repo.createQueryBuilder('r');

      if (query.region && query.region.trim()) {
        qb = qb.andWhere('r.region = :region', { region: query.region.trim() });
      }
      if (query.status && query.status.trim()) {
        qb = qb.andWhere('r.status = :status', { status: query.status.trim() });
      }
      if (query.published !== undefined) {
        qb = qb.andWhere('r.published = :published', { published: query.published });
      }
      if (query.search && query.search.trim()) {
        const term = `%${query.search.trim()}%`;
        qb = qb.andWhere(
          '(r.name LIKE :term OR r.region LIKE :term OR r.notes LIKE :term)',
          { term }
        );
      }

      const [items, total] = await qb
        .orderBy('r.region', 'ASC')
        .addOrderBy('r.name', 'ASC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        items: items.map(toDto),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error: any) {
      logger.error('List road status error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to list road status',
        details: error.message,
      };
    }
  }

  async getById(id: string): Promise<RoadStatusDto | null> {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;
    const repo = AppDataSource.getRepository(RoadStatusEntity);
    const row = await repo.findOne({ where: { id: numId } });
    return row ? toDto(row) : null;
  }

  async create(dto: CreateRoadStatusDto): Promise<RoadStatusDto> {
    try {
      if (!dto.name || !dto.name.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Name is required',
        };
      }
      if (!dto.region || !dto.region.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Region is required',
        };
      }
      const status = (dto.status || 'open').toLowerCase() as RoadStatusStatus;
      if (!VALID_STATUSES.includes(status)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        };
      }
      if (typeof dto.lat !== 'number' || typeof dto.lng !== 'number') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Latitude and longitude are required',
        };
      }

      const repo = AppDataSource.getRepository(RoadStatusEntity);
      const entity = repo.create({
        name: dto.name.trim(),
        region: dto.region.trim(),
        status,
        lat: dto.lat,
        lng: dto.lng,
        notes: dto.notes?.trim() || null,
        published: dto.published ?? true,
      });
      const saved = await repo.save(entity);
      logger.info(`Road status created: ${saved.id} ${saved.name}`);
      return toDto(saved);
    } catch (error: any) {
      if (error.statusCode) throw error;
      logger.error('Create road status error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create road status',
        details: error.message,
      };
    }
  }

  async update(id: string, dto: UpdateRoadStatusDto): Promise<RoadStatusDto> {
    const existing = await this.getById(id);
    if (!existing) {
      throw {
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND,
        message: 'Road status not found',
      };
    }
    if (dto.status !== undefined) {
      const status = dto.status.toLowerCase() as RoadStatusStatus;
      if (!VALID_STATUSES.includes(status)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        };
      }
    }
    try {
      const repo = AppDataSource.getRepository(RoadStatusEntity);
      const numId = parseInt(id, 10);
      await repo.update(numId, {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.region !== undefined && { region: dto.region.trim() }),
        ...(dto.status !== undefined && { status: (dto.status as RoadStatusStatus) }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...(dto.published !== undefined && { published: dto.published }),
      });
      const updated = await this.getById(id);
      if (!updated) throw new Error('Not found after update');
      logger.info(`Road status updated: ${id}`);
      return updated;
    } catch (error: any) {
      if (error.statusCode) throw error;
      logger.error('Update road status error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update road status',
        details: error.message,
      };
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw {
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND,
        message: 'Road status not found',
      };
    }
    try {
      const repo = AppDataSource.getRepository(RoadStatusEntity);
      await repo.delete(parseInt(id, 10));
      logger.info(`Road status deleted: ${id}`);
    } catch (error: any) {
      logger.error('Delete road status error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete road status',
        details: error.message,
      };
    }
  }

  async setPublished(id: string, published: boolean): Promise<RoadStatusDto> {
    return this.update(id, { published });
  }

  async getRegions(): Promise<string[]> {
    try {
      const repo = AppDataSource.getRepository(RoadStatusEntity);
      const rows = await repo
        .createQueryBuilder('r')
        .select('DISTINCT r.region')
        .orderBy('r.region', 'ASC')
        .getRawMany();
      return rows.map((r: { region: string }) => r.region).filter(Boolean);
    } catch (error: any) {
      logger.error('Get regions error:', error);
      return [];
    }
  }
}

export const roadStatusService = new RoadStatusService();
