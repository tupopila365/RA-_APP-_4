import { Incident } from './incidents.entity';
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
    coordinates?: {
        latitude: number;
        longitude: number;
    };
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
    coordinates?: {
        latitude: number;
        longitude: number;
    };
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
export declare class IncidentsService {
    private cachePrefix;
    private invalidateCache;
    createIncident(dto: CreateIncidentDTO, userId?: string): Promise<Incident>;
    updateIncident(incidentId: string, dto: UpdateIncidentDTO, userId?: string): Promise<Incident>;
    deleteIncident(incidentId: string): Promise<void>;
    getIncidentById(incidentId: string): Promise<Incident>;
    listIncidents(query?: ListIncidentsQuery): Promise<Incident[]>;
    findActiveForQuery(term: string, limit?: number): Promise<Incident[]>;
}
export declare const incidentsService: IncidentsService;
//# sourceMappingURL=incidents.service.d.ts.map