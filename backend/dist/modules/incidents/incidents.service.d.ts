import { IIncident, IncidentStatus, IncidentType, IncidentSeverity } from './incidents.model';
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
export declare class IncidentsService {
    private cachePrefix;
    private invalidateCache;
    createIncident(dto: CreateIncidentDTO, userId?: string): Promise<IIncident>;
    updateIncident(incidentId: string, dto: UpdateIncidentDTO, userId?: string): Promise<IIncident>;
    deleteIncident(incidentId: string): Promise<void>;
    getIncidentById(incidentId: string): Promise<IIncident>;
    listIncidents(query?: ListIncidentsQuery): Promise<IIncident[]>;
    /**
     * Public-facing helper: find recent active incidents by road/area keywords for chatbot
     */
    findActiveForQuery(term: string, limit?: number): Promise<IIncident[]>;
}
export declare const incidentsService: IncidentsService;
//# sourceMappingURL=incidents.service.d.ts.map