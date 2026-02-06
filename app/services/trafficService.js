import { ApiClient } from './api';

/**
 * Decode Google Maps encoded polyline string to coordinates array
 * @param {string} encoded - Encoded polyline string from Google Maps API
 * @returns {Array} Array of {latitude, longitude} objects
 */
export const decodePolyline = (encoded) => {
  if (!encoded) return [];
  
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }

  return poly;
};

/**
 * Get traffic status for a road, area, or landmark
 * @param {string} query - Road name, area, or landmark (e.g., "B1", "Windhoek", "Okahandja")
 * @param {string} type - Optional: 'road', 'area', or 'landmark'
 * @returns {Promise<Object>} Traffic status response with congestion level and polyline
 */
export const getTrafficStatus = async (query, type = undefined) => {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query is required to check traffic status');
    }

    const queryParams = new URLSearchParams({ query: query.trim() });
    if (type) {
      queryParams.append('type', type);
    }

    const endpoint = `/traffic/status?${queryParams.toString()}`;
    const response = await ApiClient.get(endpoint);

    if (response.success && response.data) {
      // Decode polyline if present
      if (response.data.routeSummary?.polyline) {
        const decodedCoordinates = decodePolyline(response.data.routeSummary.polyline);
        return {
          ...response.data,
          routeSummary: {
            ...response.data.routeSummary,
            decodedPolyline: decodedCoordinates,
          },
        };
      }
      return response.data;
    }

    throw new Error('Invalid response format from traffic API');
  } catch (error) {
    console.error('Traffic status API error:', error);
    throw new Error(`Failed to load traffic status: ${error.message || 'Network error'}`);
  }
};

/**
 * Get traffic status for multiple roads
 * @param {Array<string>} queries - Array of road names or locations
 * @returns {Promise<Array>} Array of traffic status responses
 */
export const getMultipleTrafficStatuses = async (queries) => {
  if (!Array.isArray(queries) || queries.length === 0) {
    return [];
  }

  try {
    // Fetch all traffic statuses in parallel
    const promises = queries.map((query) =>
      getTrafficStatus(query).catch((error) => {
        console.warn(`Failed to get traffic for ${query}:`, error.message);
        return null; // Return null for failed requests
      })
    );

    const results = await Promise.all(promises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error('Error fetching multiple traffic statuses:', error);
    return [];
  }
};

/**
 * Get congestion level color
 * @param {string} congestionLevel - 'Clear', 'Moderate', or 'Heavy'
 * @returns {string} Color hex code
 */
export const getCongestionColor = (congestionLevel) => {
  const colors = {
    Clear: '#10B981', // Green
    Moderate: '#F59E0B', // Yellow/Orange
    Heavy: '#EF4444', // Red
  };
  return colors[congestionLevel] || colors.Clear;
};

export const trafficService = {
  getTrafficStatus,
  getMultipleTrafficStatuses,
  decodePolyline,
  getCongestionColor,
};
