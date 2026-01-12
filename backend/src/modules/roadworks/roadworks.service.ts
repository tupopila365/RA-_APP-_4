import { RoadworkModel, IRoadwork, RoadworkStatus } from './roadworks.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { cacheService } from '../../utils/cache';

export interface CreateRoadworkDTO {
  title: string;
  road: string;
  section: string;
  area?: string;
  status?: RoadworkStatus;
  startDate?: Date;
  endDate?: Date;
  expectedDelayMinutes?: number;
  trafficControl?: string;
  expectedCompletion?: Date;
}

export interface UpdateRoadworkDTO extends Partial<CreateRoadworkDTO> {}

export interface ListRoadworksQuery {
  status?: RoadworkStatus | RoadworkStatus[];
  road?: string;
  area?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

class RoadworksService {
  private cachePrefix = 'chatbot-roadworks';

  private async invalidateCache(): Promise<void> {
    await cacheService.deleteAll(this.cachePrefix);
  }

  async createRoadwork(dto: CreateRoadworkDTO, userId?: string): Promise<IRoadwork> {
    try {
      const roadwork = await RoadworkModel.create({
        ...dto,
        status: dto.status || 'Planned',
        createdBy: userId,
        updatedBy: userId,
      });
      await this.invalidateCache();
      return roadwork;
    } catch (error: any) {
      logger.error('Create roadwork error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create roadwork',
        details: error.message,
      };
    }
  }

  async updateRoadwork(roadworkId: string, dto: UpdateRoadworkDTO, userId?: string): Promise<IRoadwork> {
    try {
      const roadwork = await RoadworkModel.findByIdAndUpdate(
        roadworkId,
        { ...dto, updatedBy: userId },
        { new: true, runValidators: true }
      ).lean();

      if (!roadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }

      await this.invalidateCache();
      return roadwork as unknown as IRoadwork;
    } catch (error: any) {
      logger.error('Update roadwork error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update roadwork',
        details: error.message,
      };
    }
  }

  async deleteRoadwork(roadworkId: string): Promise<void> {
    try {
      const roadwork = await RoadworkModel.findByIdAndDelete(roadworkId);
      if (!roadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }
      await this.invalidateCache();
    } catch (error: any) {
      logger.error('Delete roadwork error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete roadwork',
        details: error.message,
      };
    }
  }

  async getRoadworkById(roadworkId: string): Promise<IRoadwork> {
    try {
      const roadwork = await RoadworkModel.findById(roadworkId).lean();
      if (!roadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }
      return roadwork as unknown as IRoadwork;
    } catch (error: any) {
      logger.error('Get roadwork error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve roadwork',
        details: error.message,
      };
    }
  }

  async listRoadworks(query: ListRoadworksQuery = {}): Promise<IRoadwork[]> {
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
      if (query.fromDate || query.toDate) {
        filter.startDate = {};
        if (query.fromDate) {
          filter.startDate.$gte = query.fromDate;
        }
        if (query.toDate) {
          filter.startDate.$lte = query.toDate;
        }
      }

      const limit = Math.min(200, Math.max(1, query.limit || 50));

      const roadworks = await RoadworkModel.find(filter)
        .sort({ startDate: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      return roadworks as unknown as IRoadwork[];
    } catch (error: any) {
      logger.error('List roadworks error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve roadworks',
        details: error.message,
      };
    }
  }

  async findPublicForQuery(term: string, limit: number = 3): Promise<IRoadwork[]> {
    const filter: any = { status: { $in: ['Planned', 'Ongoing'] } };
    if (term && term.trim()) {
      const regex = new RegExp(term.trim(), 'i');
      filter.$or = [{ road: regex }, { area: regex }, { section: regex }, { title: regex }];
    }

    const roadworks = await RoadworkModel.find(filter)
      .sort({ startDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return roadworks as unknown as IRoadwork[];
  }
}

export const roadworksService = new RoadworksService();








