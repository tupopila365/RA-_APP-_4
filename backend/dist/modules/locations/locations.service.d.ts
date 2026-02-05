import { Location } from './locations.entity';
export interface CreateLocationDTO {
    name: string;
    address: string;
    region: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    contactNumber?: string;
    email?: string;
    services?: string[];
    operatingHours?: Record<string, unknown>;
    closedDays?: string[];
    specialHours?: Array<{
        date: string;
        reason: string;
        closed: boolean;
        hours?: {
            open: string;
            close: string;
        };
    }>;
}
export interface UpdateLocationDTO {
    name?: string;
    address?: string;
    region?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    contactNumber?: string;
    email?: string;
    services?: string[];
    operatingHours?: Record<string, unknown>;
    closedDays?: string[];
    specialHours?: Array<{
        date: string;
        reason: string;
        closed: boolean;
        hours?: {
            open: string;
            close: string;
        };
    }>;
}
export interface ListLocationsQuery {
    region?: string;
}
declare class LocationsService {
    createLocation(dto: CreateLocationDTO): Promise<Location>;
    listLocations(query?: ListLocationsQuery): Promise<Location[]>;
    getLocationById(locationId: string): Promise<Location>;
    updateLocation(locationId: string, dto: UpdateLocationDTO): Promise<Location>;
    deleteLocation(locationId: string): Promise<void>;
    findNearestOffices(latitude: number, longitude: number, limit?: number): Promise<Array<Location & {
        distance: number;
    }>>;
}
export declare const locationsService: LocationsService;
export {};
//# sourceMappingURL=locations.service.d.ts.map