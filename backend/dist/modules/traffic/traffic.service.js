"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trafficService = exports.buildTrafficMessage = exports.classifyCongestion = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const errors_1 = require("../../constants/errors");
const logger_1 = require("../../utils/logger");
const traffic_cache_1 = require("./traffic.cache");
const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const classifyCongestion = (delaySeconds, normalDurationSeconds) => {
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
exports.classifyCongestion = classifyCongestion;
const normalizeQuery = (query) => query.trim().replace(/\s+/g, ' ').toLowerCase();
const buildTrafficMessage = (response) => {
    const { congestionLevel, estimatedDelayMinutes, location } = response;
    const delayText = estimatedDelayMinutes <= 1
        ? 'no material delay'
        : `${Math.round(estimatedDelayMinutes)} minute${estimatedDelayMinutes >= 2 ? 's' : ''} delay`;
    return [
        'Roads Authority Namibia Advisory:',
        `${location.description} is currently ${congestionLevel.toLowerCase()}.`,
        `Estimated impact: ${delayText}.`,
        'Please exercise caution and allow additional time if travelling in this area.',
    ].join(' ');
};
exports.buildTrafficMessage = buildTrafficMessage;
class TrafficService {
    constructor() {
        this.apiKey = env_1.env.GOOGLE_MAPS_API_KEY;
        this.cacheTtlSeconds = env_1.env.TRAFFIC_CACHE_TTL_SECONDS || 180;
        this.timeoutMs = env_1.env.TRAFFIC_DIRECTIONS_TIMEOUT_MS || 8000;
    }
    async getTrafficStatus(request) {
        const normalizedQuery = normalizeQuery(request.query);
        if (!normalizedQuery) {
            throw {
                statusCode: 400,
                code: errors_1.ERROR_CODES.VALIDATION_INVALID_INPUT,
                message: 'Query is required to check traffic status',
            };
        }
        const queryType = this.resolveQueryType(request.type, normalizedQuery);
        const cacheKey = `${queryType}:${normalizedQuery}`;
        const cached = await traffic_cache_1.trafficCache.get(cacheKey);
        if (cached) {
            logger_1.logger.info('Serving traffic status from cache', { query: normalizedQuery, type: queryType });
            return cached;
        }
        this.ensureApiKey();
        const location = await this.forwardGeocode(request.query, queryType);
        const { origin, destination } = this.buildProbeRoute(location);
        const travel = await this.fetchTravelTimes(origin, destination);
        const response = {
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
        await traffic_cache_1.trafficCache.set(cacheKey, response, this.cacheTtlSeconds);
        return response;
    }
    resolveQueryType(provided, normalizedQuery) {
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
    ensureApiKey() {
        if (!this.apiKey) {
            throw {
                statusCode: 503,
                code: errors_1.ERROR_CODES.TRAFFIC_CONFIG_MISSING,
                message: 'Traffic data provider is not configured',
            };
        }
    }
    async forwardGeocode(query, queryType) {
        try {
            const response = await axios_1.default.get(GOOGLE_GEOCODE_URL, {
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
            const description = queryType === 'road'
                ? `${primary.formatted_address || query} (road focus)`
                : primary.formatted_address || query;
            return {
                description,
                latitude: lat,
                longitude: lng,
                placeId: primary.place_id,
            };
        }
        catch (error) {
            logger_1.logger.error('Traffic geocoding error', { message: error.message });
            throw {
                statusCode: 502,
                code: errors_1.ERROR_CODES.TRAFFIC_DATA_UNAVAILABLE,
                message: 'Unable to resolve location for traffic status',
                details: error.message,
            };
        }
    }
    buildProbeRoute(location) {
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
    async fetchTravelTimes(origin, destination) {
        try {
            const response = await axios_1.default.get(GOOGLE_DIRECTIONS_URL, {
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
            const congestionLevel = (0, exports.classifyCongestion)(delaySeconds, normalDurationSeconds);
            return {
                normalDurationSeconds,
                trafficDurationSeconds,
                delaySeconds,
                delayMinutes: delaySeconds / 60,
                congestionLevel,
                distanceKm,
                polyline: route?.overview_polyline?.points,
            };
        }
        catch (error) {
            logger_1.logger.error('Traffic directions error', { message: error.message });
            throw {
                statusCode: 502,
                code: errors_1.ERROR_CODES.TRAFFIC_UPSTREAM_ERROR,
                message: 'Unable to retrieve traffic conditions at this time',
                details: error.message,
            };
        }
    }
}
exports.trafficService = new TrafficService();
//# sourceMappingURL=traffic.service.js.map