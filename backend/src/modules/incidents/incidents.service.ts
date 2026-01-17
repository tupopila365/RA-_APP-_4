import { IncidentModel, IIncident, IncidentStatus, IncidentType, IncidentSeverity } from './incidents.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { cacheService } from '../../utils/cache';

export interface CreateIncidentDTO {
  title: string;
  type: IncidentType;
  road: string;
  locationDescription: string;
  area?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  reportedAt?: Date;
  expectedClearance?: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateIncidentDTO {
  title?: string;
  type?: IncidentType;
  road?: string;
  locationDescription?: string;
  area?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  reportedAt?: Date;
  expectedClearance?: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ListIncidentsQuery {
  status?: IncidentStatus | IncidentStatus[];
  road?: string;
  area?: string;
  type?: IncidentType;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

export class IncidentsService {
  private cachePrefix = 'chatbot-incidents';

  private async invalidateCache(): Promise<void> {
    await cacheService.deleteAll(this.cachePrefix);
  }

  async createIncident(dto: CreateIncidentDTO, userId?: string): Promise<IIncident> {
    try {
      const incident = await IncidentModel.create({
        ...dto,
        status: dto.status || 'Active',
        severity: dto.severity || 'Medium',
        reportedAt: dto.reportedAt || new Date(),
        createdBy: userId,
        updatedBy: userId,
      });
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

  async updateIncident(incidentId: string, dto: UpdateIncidentDTO, userId?: string): Promise<IIncident> {
    try {
      const incident = await IncidentModel.findByIdAndUpdate(
        incidentId,
        { ...dto, updatedBy: userId },
        { new: true, runValidators: true }
      ).lean();

      if (!incident) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Incident not found',
        };
      }

      await this.invalidateCache();
      return incident as unknown as IIncident;
    } catch (error: any) {
      logger.error('Update incident error:', error);
      if (error.statusCode) {
        throw error;
      }
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
      const incident = await IncidentModel.findByIdAndDelete(incidentId);
      if (!incident) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Incident not found',
        };
      }
      await this.invalidateCache();
    } catch (error: any) {
      logger.error('Delete incident error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete incident',
        details: error.message,
      };
    }
  }

  async getIncidentById(incidentId: string): Promise<IIncident> {
    try {
      const incident = await IncidentModel.findById(incidentId).lean();
      if (!incident) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Incident not found',
        };
      }
      return incident as unknown as IIncident;
    } catch (error: any) {
      logger.error('Get incident error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve incident',
        details: error.message,
      };
    }
  }

  async listIncidents(query: ListIncidentsQuery = {}): Promise<IIncident[]> {
    try {
      const filter: any = {};

      if (query.status) {
        filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
      }
      if (query.road) {
        filter.road = new RegExp(query.road.trim(), 'i');
      }
      if (query.area) {
        filter.area = new RegExp(query.area.trim(), 'i');
      }
      if (query.type) {
        filter.type = query.type;
      }
      if (query.fromDate || query.toDate) {
        filter.reportedAt = {};
        if (query.fromDate) {
          filter.reportedAt.$gte = query.fromDate;
        }
        if (query.toDate) {
          filter.reportedAt.$lte = query.toDate;
        }
      }

      const limit = Math.min(200, Math.max(1, query.limit || 50));

      const incidents = await IncidentModel.find(filter)
        .sort({ reportedAt: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return incidents as unknown as IIncident[];
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

  /**
   * Public-facing helper: find recent active incidents by road/area keywords for chatbot
   */
  async findActiveForQuery(term: string, limit: number = 3): Promise<IIncident[]> {
    const filter: any = { status: 'Active' };
    if (term && term.trim()) {
      const regex = new RegExp(term.trim(), 'i');
      filter.$or = [{ road: regex }, { area: regex }, { locationDescription: regex }, { title: regex }];
    }

    const incidents = await IncidentModel.find(filter)
      .sort({ reportedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return incidents as unknown as IIncident[];
  }
}

export const incidentsService = new IncidentsService();
















