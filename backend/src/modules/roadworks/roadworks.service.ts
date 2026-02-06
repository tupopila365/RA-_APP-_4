import { AppDataSource } from '../../config/db';
import { Roadwork } from './roadworks.entity';
import type {
  IRoadwork,
  RoadworkStatus,
  IAlternateRoute,
  IRoadClosure,
  IChangeHistoryEntry,
} from './roadworks.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { cacheService } from '../../utils/cache';
import {
  calculateRouteMetrics,
  validateRouteOverlap,
  generatePolylineCoordinates,
  validateNamibianCoordinates,
  type Coordinate,
} from '../../utils/routeCalculator';
import { validateRoadworkData } from './roadworks.validation';

export interface CreateRoadworkDTO {
  title: string;
  road: string;
  section: string;
  area?: string;
  region: string;
  status?: RoadworkStatus;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  expectedCompletion?: Date;
  alternativeRoute?: string;
  coordinates?: { latitude: number; longitude: number };
  affectedLanes?: string;
  contractor?: string;
  estimatedDuration?: string;
  expectedDelayMinutes?: number;
  trafficControl?: string;
  published?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  roadClosure?: {
    roadCode: string;
    startTown?: string;
    endTown?: string;
    startCoordinates: Coordinate;
    endCoordinates: Coordinate;
    polylineCoordinates?: Coordinate[];
  };
  alternateRoutes?: Array<{
    routeName: string;
    roadsUsed: string[];
    waypoints: Array<{ name: string; coordinates: Coordinate }>;
    vehicleType?: string[];
    distanceKm?: number;
    estimatedTime?: string;
    polylineCoordinates?: Coordinate[];
    isRecommended?: boolean;
    approved?: boolean;
  }>;
}

export interface UpdateRoadworkDTO extends Partial<CreateRoadworkDTO> {}

export interface ListRoadworksQuery {
  status?: RoadworkStatus | RoadworkStatus[];
  road?: string;
  area?: string;
  region?: string;
  published?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

function parseId(roadworkId: string): number {
  const id = parseInt(roadworkId, 10);
  if (isNaN(id)) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Roadwork not found',
    };
  }
  return id;
}

class RoadworksService {
  private cachePrefix = 'chatbot-roadworks';

  private async invalidateCache(): Promise<void> {
    await cacheService.deleteAll(this.cachePrefix);
  }

  async createRoadwork(dto: CreateRoadworkDTO, userId?: string, userEmail?: string): Promise<Roadwork> {
    try {
      const validation = validateRoadworkData(dto, false);
      if (!validation.valid) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: validation.errors.join('; '),
        };
      }

      if (validation.warnings.length > 0) {
        logger.warn('Roadwork creation warnings:', validation.warnings);
      }

      const processedAlternateRoutes = await this.processAlternateRoutes(
        dto.alternateRoutes || [],
        dto.roadClosure
          ? {
              ...dto.roadClosure,
              polylineCoordinates: dto.roadClosure.polylineCoordinates || [],
            }
          : undefined
      );

      let processedRoadClosure: IRoadClosure | undefined = undefined;
      if (dto.roadClosure) {
        processedRoadClosure = {
          ...dto.roadClosure,
          polylineCoordinates:
            dto.roadClosure.polylineCoordinates ||
            generatePolylineCoordinates([
              dto.roadClosure.startCoordinates,
              dto.roadClosure.endCoordinates,
            ]),
        };
      }

      const initialHistory: IChangeHistoryEntry = {
        timestamp: new Date(),
        userId: userId || 'system',
        userEmail: userEmail,
        action: 'created',
        changes: [
          { field: 'status', newValue: dto.status || 'Planned' },
          { field: 'published', newValue: dto.published || false },
        ],
      };

      const repo = AppDataSource.getRepository(Roadwork);
      const createPayload = {
        title: dto.title,
        road: dto.road,
        section: dto.section,
        area: dto.area ?? null,
        region: dto.region,
        status: dto.status || 'Planned',
        description: dto.description ?? null,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
        expectedCompletion: dto.expectedCompletion ?? null,
        alternativeRoute: dto.alternativeRoute ?? null,
        coordinates: dto.coordinates ?? null,
        affectedLanes: dto.affectedLanes ?? null,
        contractor: dto.contractor ?? null,
        estimatedDuration: dto.estimatedDuration ?? null,
        expectedDelayMinutes: dto.expectedDelayMinutes ?? null,
        trafficControl: dto.trafficControl ?? null,
        published: dto.published ?? false,
        priority: dto.priority ?? null,
        createdBy: userId ?? null,
        createdByEmail: userEmail ?? null,
        updatedBy: userId ?? null,
        updatedByEmail: userEmail ?? null,
        roadClosure: (processedRoadClosure ?? null) as unknown as Record<string, unknown> | null,
        alternateRoutes: processedAlternateRoutes as unknown[],
        changeHistory: [initialHistory],
      };
      const roadwork = repo.create(createPayload);
      const saved = await repo.save(roadwork) as Roadwork;
      await this.invalidateCache();
      logger.info(`Roadwork created by ${userEmail || userId}: ${saved.id}`);
      return saved;
    } catch (error: any) {
      logger.error('Create roadwork error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create roadwork',
        details: error.message,
      };
    }
  }

  async updateRoadwork(
    roadworkId: string,
    dto: UpdateRoadworkDTO,
    userId?: string,
    userEmail?: string
  ): Promise<Roadwork> {
    try {
      const id = parseId(roadworkId);
      const repo = AppDataSource.getRepository(Roadwork);
      const existingRoadwork = await repo.findOne({ where: { id } });
      if (!existingRoadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }

      const validation = validateRoadworkData(dto, true);
      if (!validation.valid) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: validation.errors.join('; '),
        };
      }

      if (validation.warnings.length > 0) {
        logger.warn('Roadwork update warnings:', validation.warnings);
      }

      const changes: Array<{ field: string; oldValue?: any; newValue?: any }> = [];
      const fieldsToTrack = [
        'status',
        'published',
        'title',
        'road',
        'section',
        'area',
        'region',
        'startDate',
        'expectedCompletion',
        'priority',
        'contractor',
      ];

      for (const field of fieldsToTrack) {
        if (dto[field as keyof UpdateRoadworkDTO] !== undefined) {
          const oldValue = (existingRoadwork as any)[field];
          const newValue = dto[field as keyof UpdateRoadworkDTO];
          const oldStr = oldValue instanceof Date ? oldValue.toISOString() : oldValue;
          const newStr = newValue instanceof Date ? new Date(newValue).toISOString() : newValue;
          if (oldStr !== newStr) {
            changes.push({ field, oldValue: oldStr, newValue: newStr });
          }
        }
      }

      if (dto.coordinates) {
        const oldCoords = existingRoadwork.coordinates;
        const newCoords = dto.coordinates;
        if (
          !oldCoords ||
          oldCoords.latitude !== newCoords.latitude ||
          oldCoords.longitude !== newCoords.longitude
        ) {
          changes.push({
            field: 'coordinates',
            oldValue: oldCoords ? `${oldCoords.latitude},${oldCoords.longitude}` : 'none',
            newValue: `${newCoords.latitude},${newCoords.longitude}`,
          });
        }
      }

      let action: IChangeHistoryEntry['action'] = 'updated';
      if (changes.some((c) => c.field === 'status')) action = 'status_changed';
      else if (changes.some((c) => c.field === 'published'))
        action = dto.published ? 'published' : 'unpublished';

      let processedAlternateRoutes = dto.alternateRoutes;
      if (dto.alternateRoutes) {
        processedAlternateRoutes = await this.processAlternateRoutes(
          dto.alternateRoutes,
          dto.roadClosure
            ? {
                ...dto.roadClosure,
                polylineCoordinates: dto.roadClosure.polylineCoordinates || [],
              }
            : undefined
        );
      }

      let processedRoadClosure: IRoadClosure | undefined = undefined;
      if (dto.roadClosure) {
        processedRoadClosure = {
          ...dto.roadClosure,
          polylineCoordinates:
            dto.roadClosure.polylineCoordinates ||
            generatePolylineCoordinates([
              dto.roadClosure.startCoordinates,
              dto.roadClosure.endCoordinates,
            ]),
        };
      }

      const historyEntry: IChangeHistoryEntry = {
        timestamp: new Date(),
        userId: userId || 'system',
        userEmail: userEmail,
        action,
        changes,
      };

      if (dto.title !== undefined) existingRoadwork.title = dto.title;
      if (dto.road !== undefined) existingRoadwork.road = dto.road;
      if (dto.section !== undefined) existingRoadwork.section = dto.section;
      if (dto.area !== undefined) existingRoadwork.area = dto.area;
      if (dto.region !== undefined) existingRoadwork.region = dto.region;
      if (dto.status !== undefined) existingRoadwork.status = dto.status;
      if (dto.description !== undefined) existingRoadwork.description = dto.description;
      if (dto.startDate !== undefined) existingRoadwork.startDate = dto.startDate;
      if (dto.endDate !== undefined) existingRoadwork.endDate = dto.endDate;
      if (dto.expectedCompletion !== undefined)
        existingRoadwork.expectedCompletion = dto.expectedCompletion;
      if (dto.alternativeRoute !== undefined)
        existingRoadwork.alternativeRoute = dto.alternativeRoute;
      if (dto.coordinates !== undefined) existingRoadwork.coordinates = dto.coordinates;
      if (dto.affectedLanes !== undefined) existingRoadwork.affectedLanes = dto.affectedLanes;
      if (dto.contractor !== undefined) existingRoadwork.contractor = dto.contractor;
      if (dto.estimatedDuration !== undefined)
        existingRoadwork.estimatedDuration = dto.estimatedDuration;
      if (dto.expectedDelayMinutes !== undefined)
        existingRoadwork.expectedDelayMinutes = dto.expectedDelayMinutes;
      if (dto.trafficControl !== undefined) existingRoadwork.trafficControl = dto.trafficControl;
      if (dto.published !== undefined) existingRoadwork.published = dto.published;
      if (dto.priority !== undefined) existingRoadwork.priority = dto.priority;
      existingRoadwork.updatedBy = userId ?? null;
      existingRoadwork.updatedByEmail = userEmail ?? null;
      if (processedRoadClosure) existingRoadwork.roadClosure = processedRoadClosure as unknown as Record<string, unknown>;
      if (processedAlternateRoutes) existingRoadwork.alternateRoutes = processedAlternateRoutes;
      existingRoadwork.changeHistory = [
        ...(Array.isArray(existingRoadwork.changeHistory) ? existingRoadwork.changeHistory : []),
        historyEntry,
      ];

      const saved = await repo.save(existingRoadwork);
      await this.invalidateCache();
      logger.info(`Roadwork updated by ${userEmail || userId}: ${roadworkId} - ${changes.length} changes`);
      return saved;
    } catch (error: any) {
      logger.error('Update roadwork error:', error);
      if (error.statusCode) throw error;
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
      const id = parseId(roadworkId);
      const repo = AppDataSource.getRepository(Roadwork);
      const roadwork = await repo.findOne({ where: { id } });
      if (!roadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }
      await repo.remove(roadwork);
      await this.invalidateCache();
    } catch (error: any) {
      logger.error('Delete roadwork error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete roadwork',
        details: error.message,
      };
    }
  }

  async getRoadworkById(roadworkId: string): Promise<Roadwork> {
    try {
      const id = parseId(roadworkId);
      const roadwork = await AppDataSource.getRepository(Roadwork).findOne({ where: { id } });
      if (!roadwork) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Roadwork not found',
        };
      }
      return roadwork;
    } catch (error: any) {
      logger.error('Get roadwork error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve roadwork',
        details: error.message,
      };
    }
  }

  async listRoadworks(query: ListRoadworksQuery = {}): Promise<{
    roadworks: Roadwork[];
    pagination: { total: number; page: number; totalPages: number; limit: number };
  }> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const skip = (page - 1) * limit;

      const repo = AppDataSource.getRepository(Roadwork);
      const qb = repo.createQueryBuilder('r');

      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        qb.andWhere('r.status IN (:...statuses)', { statuses });
      }
      if (query.road && query.road.trim()) {
        qb.andWhere('r.road LIKE :road', { road: `%${query.road.trim()}%` });
      }
      if (query.area && query.area.trim()) {
        qb.andWhere('r.area LIKE :area', { area: `%${query.area.trim()}%` });
      }
      if (query.region && query.region.trim()) {
        qb.andWhere('r.region LIKE :region', { region: `%${query.region.trim()}%` });
      }
      if (query.published !== undefined) {
        qb.andWhere('r.published = :published', { published: query.published });
      }
      if (query.priority) {
        qb.andWhere('r.priority = :priority', { priority: query.priority });
      }
      if (query.fromDate) {
        qb.andWhere('r.startDate >= :fromDate', { fromDate: query.fromDate });
      }
      if (query.toDate) {
        qb.andWhere('r.startDate <= :toDate', { toDate: query.toDate });
      }
      if (query.search && query.search.trim()) {
        qb.andWhere(
          '(r.road LIKE :search OR r.area LIKE :search OR r.region LIKE :search OR r.section LIKE :search OR r.title LIKE :search OR r.description LIKE :search)',
          { search: `%${query.search.trim()}%` }
        );
      }

      const [roadworks, total] = await qb
        .orderBy('r.startDate', 'DESC')
        .addOrderBy('r.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        roadworks,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit,
        },
      };
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

  async findPublicForQuery(term: string, limit: number = 50): Promise<Roadwork[]> {
    try {
      const repo = AppDataSource.getRepository(Roadwork);
      const qb = repo
        .createQueryBuilder('r')
        .where('r.published = :published', { published: true })
        .andWhere('r.status IN (:...statuses)', {
          statuses: [
            'Open',
            'Planned',
            'Planned Works',
            'Ongoing',
            'Ongoing Maintenance',
            'Closed',
            'Restricted',
          ],
        });

      if (term && term.trim()) {
        qb.andWhere(
          '(r.road LIKE :term OR r.area LIKE :term OR r.region LIKE :term OR r.section LIKE :term OR r.title LIKE :term OR r.description LIKE :term)',
          { term: `%${term.trim()}%` }
        );
      }

      const roadworks = await qb
        .orderBy('r.priority', 'DESC')
        .addOrderBy('r.startDate', 'DESC')
        .addOrderBy('r.createdAt', 'DESC')
        .take(Math.min(100, limit))
        .getMany();

      return roadworks;
    } catch (error: any) {
      logger.error('Find public roadworks error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve public roadworks',
        details: error.message,
      };
    }
  }

  private async processAlternateRoutes(
    routes: Array<{
      routeName: string;
      roadsUsed: string[];
      waypoints: Array<{ name: string; coordinates: Coordinate }>;
      vehicleType?: string[];
      distanceKm?: number;
      estimatedTime?: string;
      polylineCoordinates?: Coordinate[];
      isRecommended?: boolean;
      approved?: boolean;
    }>,
    roadClosure?: {
      roadCode: string;
      startTown?: string;
      endTown?: string;
      startCoordinates: Coordinate;
      endCoordinates: Coordinate;
      polylineCoordinates: Coordinate[];
    }
  ): Promise<IAlternateRoute[]> {
    const processedRoutes: IAlternateRoute[] = [];

    for (const route of routes) {
      for (const waypoint of route.waypoints) {
        if (!validateNamibianCoordinates(waypoint.coordinates)) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Invalid coordinates for waypoint "${waypoint.name}". Must be within Namibia bounds.`,
          };
        }
      }

      let { distanceKm, estimatedTime } = route;
      if (!distanceKm || !estimatedTime) {
        const calculated = calculateRouteMetrics(route.waypoints, route.roadsUsed);
        distanceKm = distanceKm || calculated.distanceKm;
        estimatedTime = estimatedTime || calculated.estimatedTime;
      }

      let polylineCoordinates = route.polylineCoordinates;
      if (!polylineCoordinates || polylineCoordinates.length === 0) {
        polylineCoordinates = generatePolylineCoordinates(
          route.waypoints.map((wp) => wp.coordinates)
        );
      }

      if (roadClosure && roadClosure.polylineCoordinates) {
        const hasOverlap = validateRouteOverlap(
          polylineCoordinates,
          roadClosure.polylineCoordinates,
          0.5
        );
        if (hasOverlap) {
          logger.warn(`Alternate route "${route.routeName}" overlaps with closed road`);
        }
      }

      processedRoutes.push({
        routeName: route.routeName,
        roadsUsed: route.roadsUsed,
        waypoints: route.waypoints,
        vehicleType: route.vehicleType || ['All'],
        distanceKm: distanceKm!,
        estimatedTime: estimatedTime!,
        polylineCoordinates,
        isRecommended: route.isRecommended || false,
        approved: route.approved || false,
      });
    }

    return processedRoutes;
  }
}

export const roadworksService = new RoadworksService();
