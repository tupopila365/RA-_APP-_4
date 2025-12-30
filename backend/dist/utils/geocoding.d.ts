export interface GeocodingResult {
    town: string;
    region: string;
}
/**
 * Reverse geocode coordinates to get town and region
 * Uses OpenStreetMap Nominatim API by default (free, no API key required)
 * Can be configured to use Google Maps Geocoding API if API key is provided
 */
export declare function reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult>;
//# sourceMappingURL=geocoding.d.ts.map