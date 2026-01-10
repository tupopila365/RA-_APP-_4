import { IRoadwork, RoadworkStatus } from './roadworks.model';
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
export interface UpdateRoadworkDTO extends Partial<CreateRoadworkDTO> {
}
export interface ListRoadworksQuery {
    status?: RoadworkStatus | RoadworkStatus[];
    road?: string;
    area?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
}
declare class RoadworksService {
    private cachePrefix;
    private invalidateCache;
    createRoadwork(dto: CreateRoadworkDTO, userId?: string): Promise<IRoadwork>;
    updateRoadwork(roadworkId: string, dto: UpdateRoadworkDTO, userId?: string): Promise<IRoadwork>;
    deleteRoadwork(roadworkId: string): Promise<void>;
    getRoadworkById(roadworkId: string): Promise<IRoadwork>;
    listRoadworks(query?: ListRoadworksQuery): Promise<IRoadwork[]>;
    findPublicForQuery(term: string, limit?: number): Promise<IRoadwork[]>;
}
export declare const roadworksService: RoadworksService;
export {};
//# sourceMappingURL=roadworks.service.d.ts.map