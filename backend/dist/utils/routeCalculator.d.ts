export interface Coordinate {
    latitude: number;
    longitude: number;
}
export interface RouteCalculationResult {
    distanceKm: number;
    estimatedTime: string;
}
/**
 * Calculate the distance between two coordinates using the Haversine formula
 */
export declare function calculateDistance(coord1: Coordinate, coord2: Coordinate): number;
/**
 * Calculate total distance for a route with multiple waypoints
 */
export declare function calculateRouteDistance(coordinates: Coordinate[]): number;
/**
 * Estimate travel time based on distance and road type
 */
export declare function estimateTime(distanceKm: number, roadsUsed?: string[]): string;
/**
 * Auto-calculate distance and time for an alternate route
 */
export declare function calculateRouteMetrics(waypoints: Array<{
    coordinates: Coordinate;
}>, roadsUsed?: string[]): RouteCalculationResult;
/**
 * Validate that alternate routes do not overlap with closed road coordinates
 */
export declare function validateRouteOverlap(alternateRouteCoordinates: Coordinate[], closedRoadCoordinates: Coordinate[], toleranceKm?: number): boolean;
/**
 * Generate polyline coordinates between waypoints using simple interpolation
 * In production, this would integrate with a routing service like OSRM or Google Directions
 */
export declare function generatePolylineCoordinates(waypoints: Coordinate[]): Coordinate[];
/**
 * Validate coordinates are within Namibia bounds
 */
export declare function validateNamibianCoordinates(coord: Coordinate): boolean;
//# sourceMappingURL=routeCalculator.d.ts.map