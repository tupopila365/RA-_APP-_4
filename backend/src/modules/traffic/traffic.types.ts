export type TrafficQueryType = 'road' | 'area' | 'landmark';

export interface TrafficUserLocation {
  latitude: number;
  longitude: number;
}

export interface TrafficStatusRequest {
  query: string;
  type?: TrafficQueryType;
  userLocation?: TrafficUserLocation;
}

export interface TrafficResolvedLocation {
  description: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export type CongestionLevel = 'Clear' | 'Moderate' | 'Heavy';

export interface TravelTimeBreakdown {
  normalDurationSeconds: number;
  trafficDurationSeconds: number;
  delaySeconds: number;
  delayMinutes: number;
  congestionLevel: CongestionLevel;
}

export interface TrafficStatusResponse {
  query: {
    raw: string;
    normalized: string;
    type: TrafficQueryType;
  };
  location: TrafficResolvedLocation;
  congestionLevel: CongestionLevel;
  estimatedDelayMinutes: number;
  normalTravelMinutes: number;
  trafficTravelMinutes: number;
  routeSummary: {
    distanceKm: number;
    durationMinutes: number;
    durationInTrafficMinutes: number;
    polyline?: string;
  };
  source: 'google_maps';
  updatedAt: string;
}

export interface TrafficStatusError {
  code: string;
  message: string;
  statusCode: number;
}















