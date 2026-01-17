import axios from 'axios';
import { env } from '../../config/env';
import { ERROR_CODES } from '../../constants/errors';
import { logger } from '../../utils/logger';
import { trafficCache } from './traffic.cache';
import {
  CongestionLevel,
  TrafficQueryType,
  TrafficResolvedLocation,
  TrafficStatusRequest,
  TrafficStatusResponse,
  TravelTimeBreakdown,
} from './traffic.types';

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const classifyCongestion = (
  delaySeconds: number,
  normalDurationSeconds: number
): CongestionLevel => {
  const safeNormal = normalDurationSeconds > 0 ? normalDurationSeconds : 1;
  const ratio = delaySeconds / safeNormal;
  const delayMinutes = delaySeconds / 60;

  if (ratio >= 0.5 || delayMinutes >= 15) {
    return 'Heavy';
  }

  if (ratio >= 0.2 || delayMinutes >= 5) {
    return 'Moderate';
  }

  return 'Clear';
};

const normalizeQuery = (query: string): string => query.trim().replace(/\s+/g, ' ').toLowerCase();

export const buildTrafficMessage = (response: TrafficStatusResponse): string => {
  const { congestionLevel, estimatedDelayMinutes, location } = response;
  const delayText =
    estimatedDelayMinutes <= 1
      ? 'no material delay'
      : `${Math.round(estimatedDelayMinutes)} minute${estimatedDelayMinutes >= 2 ? 's' : ''} delay`;

  return [
    'Roads Authority Namibia Advisory:',
    `${location.description} is currently ${congestionLevel.toLowerCase()}.`,
    `Estimated impact: ${delayText}.`,
    'Please exercise caution and allow additional time if travelling in this area.',
  ].join(' ');
};

class TrafficService {
  private apiKey: string | undefined;
  private cacheTtlSeconds: number;
  private timeoutMs: number;

  constructor() {
    this.apiKey = env.GOOGLE_MAPS_API_KEY;
    this.cacheTtlSeconds = env.TRAFFIC_CACHE_TTL_SECONDS || 180;
    this.timeoutMs = env.TRAFFIC_DIRECTIONS_TIMEOUT_MS || 8000;
  }

  async getTrafficStatus(request: TrafficStatusRequest): Promise<TrafficStatusResponse> {
    const normalizedQuery = normalizeQuery(request.query);
    if (!normalizedQuery) {
      throw {
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_INVALID_INPUT,
        message: 'Query is required to check traffic status',
      };
    }

    const queryType = this.resolveQueryType(request.type, normalizedQuery);
    const cacheKey = `${queryType}:${normalizedQuery}`;

    const cached = await trafficCache.get(cacheKey);
    if (cached) {
      logger.info('Serving traffic status from cache', { query: normalizedQuery, type: queryType });
      return cached;
    }

    this.ensureApiKey();

    const location = await this.forwardGeocode(request.query, queryType);
    const { origin, destination } = this.buildProbeRoute(location);
    const travel = await this.fetchTravelTimes(origin, destination);

    const response: TrafficStatusResponse = {
      query: {
        raw: request.query,
        normalized: normalizedQuery,
        type: queryType,
      },
      location,
      congestionLevel: travel.congestionLevel,
      estimatedDelayMinutes: Math.round(travel.delaySeconds / 60),
      normalTravelMinutes: Math.round(travel.normalDurationSeconds / 60),
      trafficTravelMinutes: Math.round(travel.trafficDurationSeconds / 60),
      routeSummary: {
        distanceKm: travel.distanceKm,
        durationMinutes: travel.normalDurationSeconds / 60,
        durationInTrafficMinutes: travel.trafficDurationSeconds / 60,
        polyline: travel.polyline,
      },
      source: 'google_maps',
      updatedAt: new Date().toISOString(),
    };

    await trafficCache.set(cacheKey, response, this.cacheTtlSeconds);
    return response;
  }

  private resolveQueryType(provided: TrafficQueryType | undefined, normalizedQuery: string): TrafficQueryType {
    if (provided) {
      return provided;
    }

    const roadPattern = /\b(b|a|c)\s*[-]?\s*\d{1,3}\b/i;
    if (roadPattern.test(normalizedQuery) || normalizedQuery.includes('road') || normalizedQuery.includes('highway')) {
      return 'road';
    }

    if (normalizedQuery.includes('near') || normalizedQuery.includes('by') || normalizedQuery.includes('close to')) {
      return 'landmark';
    }

    return 'area';
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw {
        statusCode: 503,
        code: ERROR_CODES.TRAFFIC_CONFIG_MISSING,
        message: 'Traffic data provider is not configured',
      };
    }
  }

  private async forwardGeocode(query: string, queryType: TrafficQueryType): Promise<TrafficResolvedLocation> {
    try {
      const response = await axios.get(GOOGLE_GEOCODE_URL, {
        params: {
          address: `${query}, Namibia`,
          region: 'na',
          key: this.apiKey,
        },
        timeout: this.timeoutMs,
      });

      if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
        throw new Error(`Geocoding failed with status ${response.data.status}`);
      }

      const primary = response.data.results[0];
      const { lat, lng } = primary.geometry.location;

      const description =
        queryType === 'road'
          ? `${primary.formatted_address || query} (road focus)`
          : primary.formatted_address || query;

      return {
        description,
        latitude: lat,
        longitude: lng,
        placeId: primary.place_id,
      };
    } catch (error: any) {
      logger.error('Traffic geocoding error', { message: error.message });
      throw {
        statusCode: 502,
        code: ERROR_CODES.TRAFFIC_DATA_UNAVAILABLE,
        message: 'Unable to resolve location for traffic status',
        details: error.message,
      };
    }
  }

  private buildProbeRoute(location: TrafficResolvedLocation): {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  } {
    const offsetLat = 0.02; // ~2.2km
    const offsetLng = 0.02; // ~2.2km depending on latitude

    const origin = {
      lat: clamp(location.latitude + offsetLat, -90, 90),
      lng: clamp(location.longitude - offsetLng, -180, 180),
    };

    const destination = {
      lat: clamp(location.latitude - offsetLat, -90, 90),
      lng: clamp(location.longitude + offsetLng, -180, 180),
    };

    return { origin, destination };
  }

  private async fetchTravelTimes(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<TravelTimeBreakdown & { distanceKm: number; polyline?: string }> {
    try {
      const response = await axios.get(GOOGLE_DIRECTIONS_URL, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
          departure_time: 'now',
          traffic_model: 'best_guess',
          mode: 'driving',
        },
        timeout: this.timeoutMs,
      });

      const route = response.data.routes?.[0];
      const leg = route?.legs?.[0];

      if (!leg || !leg.duration || !leg.duration.value) {
        throw new Error('Missing travel time data');
      }

      const normalDurationSeconds = Number(leg.duration.value);
      const trafficDurationSeconds = Number(leg.duration_in_traffic?.value || leg.duration.value);
      const distanceKm = leg.distance?.value ? Number(leg.distance.value) / 1000 : 0;

      const delaySeconds = Math.max(0, trafficDurationSeconds - normalDurationSeconds);
      const congestionLevel = classifyCongestion(delaySeconds, normalDurationSeconds);

      return {
        normalDurationSeconds,
        trafficDurationSeconds,
        delaySeconds,
        delayMinutes: delaySeconds / 60,
        congestionLevel,
        distanceKm,
        polyline: route?.overview_polyline?.points,
      };
    } catch (error: any) {
      logger.error('Traffic directions error', { message: error.message });
      throw {
        statusCode: 502,
        code: ERROR_CODES.TRAFFIC_UPSTREAM_ERROR,
        message: 'Unable to retrieve traffic conditions at this time',
        details: error.message,
      };
    }
  }
}

export const trafficService = new TrafficService();
















