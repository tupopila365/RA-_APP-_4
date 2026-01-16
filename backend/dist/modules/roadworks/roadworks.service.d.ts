import { IRoadwork, RoadworkStatus } from './roadworks.model';
import { Coordinate } from '../../utils/routeCalculator';
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
    coordinates?: {
        latitude: number;
        longitude: number;
    };
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
        waypoints: Array<{
            name: string;
            coordinates: Coordinate;
        }>;
        vehicleType?: string[];
        distanceKm?: number;
        estimatedTime?: string;
        polylineCoordinates?: Coordinate[];
        isRecommended?: boolean;
        approved?: boolean;
    }>;
}
export interface UpdateRoadworkDTO extends Partial<CreateRoadworkDTO> {
}
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
declare class RoadworksService {
    private cachePrefix;
    private invalidateCache;
    createRoadwork(dto: CreateRoadworkDTO, userId?: string, userEmail?: string): Promise<IRoadwork>;
    updateRoadwork(roadworkId: string, dto: UpdateRoadworkDTO, userId?: string, userEmail?: string): Promise<IRoadwork>;
    deleteRoadwork(roadworkId: string): Promise<void>;
    getRoadworkById(roadworkId: string): Promise<IRoadwork>;
    listRoadworks(query?: ListRoadworksQuery): Promise<{
        roadworks: IRoadwork[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    }>;
    findPublicForQuery(term: string, limit?: number): Promise<IRoadwork[]>;
    /**
     * Process and validate alternate routes
     */
    private processAlternateRoutes;
}
export declare const roadworksService: RoadworksService;
export {};
//# sourceMappingURL=roadworks.service.d.ts.map