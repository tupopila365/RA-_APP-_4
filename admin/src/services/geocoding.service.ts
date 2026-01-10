/**
 * Geocoding Validation Service
 * Uses OpenStreetMap Nominatim API to validate road locations
 */

export interface GeocodingResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  displayName?: string;
  error?: string;
}

/**
 * Geocode a location using OpenStreetMap Nominatim
 * Returns coordinates and display name if found
 * 
 * @param searchQuery - Full search string (e.g., "B1 National Road Section 5 Windhoek Namibia")
 * @returns Promise<GeocodingResult>
 */
export async function geocodeLocation(searchQuery: string): Promise<GeocodingResult> {
  // Validate input
  if (!searchQuery || searchQuery.trim().length < 3) {
    return {
      success: false,
      error: 'Search query too short',
    };
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RoadsAuthority-Admin/1.0',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        success: true,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }

    return {
      success: false,
      error: 'Location not found',
    };
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error.message || 'Geocoding request failed',
    };
  }
}

/**
 * Validate that a road location can be geocoded
 * Uses debouncing-friendly pattern
 * 
 * @param roadName - Official road name
 * @param section - Optional section identifier
 * @param area - Town or area name (required)
 * @param region - Namibian region (required)
 * @returns Promise<GeocodingResult>
 */
export async function validateRoadLocation(
  roadName: string,
  section: string | undefined,
  area: string,
  region: string
): Promise<GeocodingResult> {
  // Build search query
  const parts = [roadName, section, area, region, 'Namibia'].filter(Boolean);
  const searchQuery = parts.join(' ');

  return geocodeLocation(searchQuery);
}

/**
 * Check if coordinates are valid
 * Namibia bounds: roughly lat -17 to -29, lon 11 to 26
 */
export function validateCoordinates(
  latitude: number | string | undefined,
  longitude: number | string | undefined
): { valid: boolean; error?: string } {
  if (latitude === undefined || latitude === '' || longitude === undefined || longitude === '') {
    return { valid: false, error: 'Both latitude and longitude are required' };
  }

  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  if (isNaN(lat) || isNaN(lon)) {
    return { valid: false, error: 'Coordinates must be valid numbers' };
  }

  // Check Namibia bounds (with some buffer)
  if (lat < -30 || lat > -16 || lon < 10 || lon > 27) {
    return {
      valid: false,
      error: 'Coordinates are outside Namibia. Please verify the location.',
    };
  }

  return { valid: true };
}

/**
 * Reverse geocode coordinates to get location name
 * Useful for validating manually entered coordinates
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RoadsAuthority-Admin/1.0',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data && data.display_name) {
      return {
        success: true,
        latitude,
        longitude,
        displayName: data.display_name,
      };
    }

    return {
      success: false,
      error: 'Location not found',
    };
  } catch (error: any) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error.message || 'Reverse geocoding failed',
    };
  }
}

/**
 * Debounced geocoding validation hook helper
 * Returns a function that can be used with useEffect
 */
export function createDebouncedGeocoder(delayMs: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounce(
    callback: () => Promise<void>
  ): () => void {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(callback, delayMs);
    };
  };
}

