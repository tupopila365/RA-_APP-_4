"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocode = reverseGeocode;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
// Simple in-memory cache to avoid excessive API calls
const geocodingCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
/**
 * Reverse geocode coordinates to get town and region
 * Uses OpenStreetMap Nominatim API by default (free, no API key required)
 * Can be configured to use Google Maps Geocoding API if API key is provided
 */
async function reverseGeocode(latitude, longitude) {
    try {
        // Create cache key
        const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        // Check cache first
        const cached = geocodingCache.get(cacheKey);
        if (cached) {
            const entry = cached;
            const age = Date.now() - entry.timestamp;
            if (age < CACHE_TTL) {
                logger_1.logger.debug(`Geocoding cache hit for ${cacheKey}`);
                return entry.result;
            }
            // Cache expired, remove it
            geocodingCache.delete(cacheKey);
        }
        // Determine which service to use
        const geocodingService = process.env.GEOCODING_SERVICE || 'nominatim';
        const apiKey = process.env.GEOCODING_API_KEY;
        let result;
        if (geocodingService === 'google' && apiKey) {
            result = await reverseGeocodeGoogle(latitude, longitude, apiKey);
        }
        else {
            result = await reverseGeocodeNominatim(latitude, longitude);
        }
        // Cache the result
        geocodingCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
        });
        logger_1.logger.info(`Geocoded coordinates ${latitude}, ${longitude} to ${result.town}, ${result.region}`);
        return result;
    }
    catch (error) {
        logger_1.logger.error('Geocoding error:', {
            latitude,
            longitude,
            error: error.message,
        });
        // Return default values on error
        return {
            town: 'Unknown',
            region: 'Unknown',
        };
    }
}
/**
 * Reverse geocode using OpenStreetMap Nominatim API
 */
async function reverseGeocodeNominatim(latitude, longitude) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse`;
        const response = await axios_1.default.get(url, {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                addressdetails: 1,
                zoom: 18,
            },
            headers: {
                'User-Agent': 'Roads-Authority-App/1.0', // Required by Nominatim
            },
            timeout: 5000,
        });
        const data = response.data;
        const address = data.address || {};
        // Extract town/city (try multiple fields)
        const town = address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            'Unknown';
        // Extract region (try multiple fields)
        const region = address.state ||
            address.region ||
            address.province ||
            address.county ||
            'Unknown';
        return {
            town: town.toString(),
            region: region.toString(),
        };
    }
    catch (error) {
        logger_1.logger.error('Nominatim geocoding error:', error.message);
        throw error;
    }
}
/**
 * Reverse geocode using Google Maps Geocoding API
 */
async function reverseGeocodeGoogle(latitude, longitude, apiKey) {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios_1.default.get(url, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: apiKey,
            },
            timeout: 5000,
        });
        const data = response.data;
        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error(`Google Geocoding API error: ${data.status}`);
        }
        const result = data.results[0];
        const addressComponents = result.address_components || [];
        let town = 'Unknown';
        let region = 'Unknown';
        // Extract town/city
        for (const component of addressComponents) {
            if (component.types.includes('locality') ||
                component.types.includes('sublocality') ||
                component.types.includes('administrative_area_level_3')) {
                town = component.long_name;
                break;
            }
        }
        // Extract region/state
        for (const component of addressComponents) {
            if (component.types.includes('administrative_area_level_1') ||
                component.types.includes('administrative_area_level_2')) {
                region = component.long_name;
                break;
            }
        }
        return {
            town,
            region,
        };
    }
    catch (error) {
        logger_1.logger.error('Google geocoding error:', error.message);
        throw error;
    }
}
//# sourceMappingURL=geocoding.js.map