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
      error: `Coordinates (${lat}, ${lon}) are outside Namibia. Namibian coordinates should be: Latitude: -17 to -29, Longitude: 11 to 26. Example: Windhoek (-22.5609, 17.0658)`,
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
  console.log(`🌐 Reverse geocoding: ${latitude}, ${longitude}`);
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`;
    console.log('📡 Request URL:', url);
    
    // Create AbortController for timeout (more compatible than AbortSignal.timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoadsAuthority-Admin/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // Clear timeout if request completes
    
    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ HTTP error:', errorMsg);
      
      // Handle specific HTTP errors
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment and try again.',
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          error: 'Geocoding service temporarily unavailable. Please try again later.',
        };
      }
      
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data = await response.json();
    console.log('📍 Response data:', data);

    if (data && data.display_name) {
      console.log('✅ Location found:', data.display_name);
      return {
        success: true,
        latitude,
        longitude,
        displayName: data.display_name,
      };
    }

    // If no result, try with lower zoom level for broader area
    console.log('⚠️ No result with high zoom, trying broader search...');
    
    try {
      const broadUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=10`;
      const broadResponse = await fetch(broadUrl, {
        headers: {
          'User-Agent': 'RoadsAuthority-Admin/1.0',
          'Accept': 'application/json',
        },
      });
      
      if (broadResponse.ok) {
        const broadData = await broadResponse.json();
        if (broadData && broadData.display_name) {
          console.log('✅ Location found with broader search:', broadData.display_name);
          return {
            success: true,
            latitude,
            longitude,
            displayName: `${broadData.display_name} (approximate area)`,
          };
        }
      }
    } catch (broadError) {
      console.warn('Broader search also failed:', broadError);
    }

    console.warn('⚠️ No location data found for these coordinates');
    return {
      success: false,
      error: 'No location found for these coordinates. The area might be remote or not well-mapped in OpenStreetMap.',
    };
  } catch (error: any) {
    console.error('❌ Reverse geocoding error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Reverse geocoding failed';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. The geocoding service may be slow or unavailable.';
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'Browser security policy blocked the request. This may happen in some development environments.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
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



