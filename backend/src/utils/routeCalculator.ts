import { logger } from './logger';

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
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance for a route with multiple waypoints
 */
export function calculateRouteDistance(coordinates: Coordinate[]): number {
  if (coordinates.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate travel time based on distance and road type
 */
export function estimateTime(distanceKm: number, roadsUsed: string[] = []): string {
  // Average speeds by road type in Namibia (km/h)
  const speedMap: { [key: string]: number } = {
    'A': 100, // Trunk roads (A1, A2, etc.)
    'B': 80,  // Main roads (B1, B2, etc.)
    'C': 60,  // District roads (C28, C40, etc.)
    'D': 40,  // Local roads (D1265, etc.)
    'M': 50,  // Municipal roads
    'T': 30,  // Town roads
  };
  
  let averageSpeed = 60; // Default speed
  
  if (roadsUsed.length > 0) {
    const speeds = roadsUsed.map(road => {
      const roadType = road.charAt(0).toUpperCase();
      return speedMap[roadType] || 60;
    });
    averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  }
  
  const hours = distanceKm / averageSpeed;
  const totalMinutes = Math.round(hours * 60);
  
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}

/**
 * Auto-calculate distance and time for an alternate route
 */
export function calculateRouteMetrics(
  waypoints: Array<{ coordinates: Coordinate }>,
  roadsUsed: string[] = []
): RouteCalculationResult {
  const coordinates = waypoints.map(wp => wp.coordinates);
  const distanceKm = calculateRouteDistance(coordinates);
  const estimatedTime = estimateTime(distanceKm, roadsUsed);
  
  return { distanceKm, estimatedTime };
}

/**
 * Validate that alternate routes do not overlap with closed road coordinates
 */
export function validateRouteOverlap(
  alternateRouteCoordinates: Coordinate[],
  closedRoadCoordinates: Coordinate[],
  toleranceKm: number = 0.5
): boolean {
  for (const altCoord of alternateRouteCoordinates) {
    for (const closedCoord of closedRoadCoordinates) {
      const distance = calculateDistance(altCoord, closedCoord);
      if (distance <= toleranceKm) {
        return true; // Overlap detected
      }
    }
  }
  return false; // No overlap
}

/**
 * Generate polyline coordinates between waypoints using simple interpolation
 * In production, this would integrate with a routing service like OSRM or Google Directions
 */
export function generatePolylineCoordinates(waypoints: Coordinate[]): Coordinate[] {
  if (waypoints.length < 2) return waypoints;
  
  const polyline: Coordinate[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Add start point
    polyline.push(start);
    
    // Add interpolated points (simple linear interpolation)
    const steps = Math.max(2, Math.floor(calculateDistance(start, end) * 2)); // 2 points per km
    
    for (let step = 1; step < steps; step++) {
      const ratio = step / steps;
      const interpolated: Coordinate = {
        latitude: start.latitude + (end.latitude - start.latitude) * ratio,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio,
      };
      polyline.push(interpolated);
    }
  }
  
  // Add final point
  polyline.push(waypoints[waypoints.length - 1]);
  
  return polyline;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate coordinates are within Namibia bounds
 */
export function validateNamibianCoordinates(coord: Coordinate): boolean {
  // Namibia approximate bounds
  const bounds = {
    north: -16.5,
    south: -29.0,
    east: 25.3,
    west: 11.7,
  };
  
  return (
    coord.latitude >= bounds.south &&
    coord.latitude <= bounds.north &&
    coord.longitude >= bounds.west &&
    coord.longitude <= bounds.east
  );
}