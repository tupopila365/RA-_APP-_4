import { ILocation } from './locations.model';
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
}
export interface ListLocationsQuery {
    region?: string;
}
declare class LocationsService {
    /**
     * Create a new location
     */
    createLocation(dto: CreateLocationDTO): Promise<ILocation>;
    /**
     * List locations with optional filtering by region
     */
    listLocations(query?: ListLocationsQuery): Promise<ILocation[]>;
    /**
     * Get a single location by ID
     */
    getLocationById(locationId: string): Promise<ILocation>;
    /**
     * Update a location
     */
    updateLocation(locationId: string, dto: UpdateLocationDTO): Promise<ILocation>;
    /**
     * Delete a location
     */
    deleteLocation(locationId: string): Promise<void>;
    /**
     * Find nearest offices to a given location
     *
     * @param latitude - User's latitude
     * @param longitude - User's longitude
     * @param limit - Maximum number of offices to return (default: 5)
     * @returns Array of offices with distance in kilometers, sorted by distance
     */
    findNearestOffices(latitude: number, longitude: number, limit?: number): Promise<Array<ILocation & {
        distance: number;
    }>>;
}
export declare const locationsService: LocationsService;
export {};
//# sourceMappingURL=locations.service.d.ts.map