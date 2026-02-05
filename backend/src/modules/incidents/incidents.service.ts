import { AppDataSource } from '../../config/db';
import { Incident } from './incidents.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { cacheService } from '../../utils/cache';

export interface CreateIncidentDTO {
  title: string;
  type: string;
  road: string;
  locationDescription: string;
  area?: string;
  status?: string;
  severity?: string;
  reportedAt?: Date;
  expectedClearance?: Date;
  coordinates?: { latitude: number; longitude: number };
}

export interface UpdateIncidentDTO {
  title?: string;
  type?: string;
  road?: string;
  locationDescription?: string;
  area?: string;
  status?: string;
  severity?: string;
  reportedAt?: Date;
  expectedClearance?: Date;
  coordinates?: { latitude: number; longitude: number };
}

export interface ListIncidentsQuery {
  status?: string | string[];
  road?: string;
  area?: string;
  type?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

export class IncidentsService {
  private cachePrefix = 'chatbot-incidents';

  private async invalidateCache(): Promise<void> {
    await cacheService.deleteAll(this.cachePrefix);
  }

  async createIncident(dto: CreateIncidentDTO, userId?: string): Promise<Incident> {
    try {
      const repo = AppDataSource.getRepository(Incident);
      const incident = repo.create({
        title: dto.title,
        type: dto.type as Incident['type'],
        road: dto.road,
        locationDescription: dto.locationDescription,
        area: dto.area,
        status: (dto.status as Incident['status']) || 'Active',
        severity: (dto.severity as Incident['severity']) || 'Medium',
        reportedAt: dto.reportedAt || new Date(),
        expectedClearance: dto.expectedClearance,
        coordinates: dto.coordinates,
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
      });
      await repo.save(incident);
      await this.invalidateCache();
      return incident;
    } catch (error: any) {
      logger.error('Create incident error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create incident',
        details: error.message,
      };
    }
  }

  async updateIncident(incidentId: string, dto: UpdateIncidentDTO, userId?: string): Promise<Incident> {
    try {
      const id = parseInt(incidentId, 10);
      const repo = AppDataSource.getRepository(Incident);
      const incident = await repo.findOne({ where: { id } });
      if (!incident) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
      }
      Object.assign(incident, dto, { updatedBy: userId });
      await repo.save(incident);
      await this.invalidateCache();
      return incident;
    } catch (error: any) {
      logger.error('Update incident error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update incident',
        details: error.message,
      };
    }
  }

  async deleteIncident(incidentId: string): Promise<void> {
    try {
      const id = parseInt(incidentId, 10);
      const repo = AppDataSource.getRepository(Incident);
      const incident = await repo.findOne({ where: { id } });
      if (!incident) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
      }
      await repo.remove(incident);
      await this.invalidateCache();
    } catch (error: any) {
      logger.error('Delete incident error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete incident',
        details: error.message,
      };
    }
  }

  async getIncidentById(incidentId: string): Promise<Incident> {
    try {
      const id = parseInt(incidentId, 10);
      const repo = AppDataSource.getRepository(Incident);
      const incident = await repo.findOne({ where: { id } });
      if (!incident) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
      }
      return incident;
    } catch (error: any) {
      logger.error('Get incident error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve incident',
        details: error.message,
      };
    }
  }

  async listIncidents(query: ListIncidentsQuery = {}): Promise<Incident[]> {
    try {
      const limit = Math.min(200, Math.max(1, query.limit || 50));
      const repo = AppDataSource.getRepository(Incident);
      const qb = repo.createQueryBuilder('i');
      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        qb.andWhere('i.status IN (:...statuses)', { statuses });
      }
      if (query.road) qb.andWhere('i.road LIKE :road', { road: `%${query.road.trim()}%` });
      if (query.area) qb.andWhere('i.area LIKE :area', { area: `%${query.area.trim()}%` });
      if (query.type) qb.andWhere('i.type = :type', { type: query.type });
      if (query.fromDate) qb.andWhere('i.reportedAt >= :fromDate', { fromDate: query.fromDate });
      if (query.toDate) qb.andWhere('i.reportedAt <= :toDate', { toDate: query.toDate });
      const incidents = await qb
        .orderBy('i.reportedAt', 'DESC')
        .addOrderBy('i.createdAt', 'DESC')
        .take(limit)
        .getMany();
      return incidents;
    } catch (error: any) {
      logger.error('List incidents error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve incidents',
        details: error.message,
      };
    }
  }

  async findActiveForQuery(term: string, limit: number = 3): Promise<Incident[]> {
    const repo = AppDataSource.getRepository(Incident);
    const qb = repo
      .createQueryBuilder('i')
      .where('i.status = :status', { status: 'Active' })
      .orderBy('i.reportedAt', 'DESC')
      .addOrderBy('i.createdAt', 'DESC')
      .take(limit);
    if (term && term.trim()) {
      qb.andWhere(
        '(i.road LIKE :term OR i.area LIKE :term OR i.locationDescription LIKE :term OR i.title LIKE :term)',
        { term: `%${term.trim()}%` }
      );
    }
    return qb.getMany();
  }
}

export const incidentsService = new IncidentsService();
