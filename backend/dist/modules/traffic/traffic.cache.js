"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trafficCache = exports.TrafficCache = void 0;
const cache_1 = require("../../utils/cache");
const logger_1 = require("../../utils/logger");
// Lightweight in-memory cache to reduce Redis dependency for short-lived traffic data
const memoryCache = new Map();
class TrafficCache {
    async get(key) {
        const now = Date.now();
        // Try Redis first (if configured)
        const redisValue = await cache_1.cacheService.get('traffic', key);
        if (redisValue) {
            return redisValue;
        }
        // Fallback to local memory cache
        const entry = memoryCache.get(key);
        if (entry && entry.expiresAt > now) {
            logger_1.logger.debug(`Traffic cache hit (memory) for key ${key}`);
            return entry.value;
        }
        if (entry) {
            memoryCache.delete(key);
        }
        logger_1.logger.debug(`Traffic cache miss for key ${key}`);
        return null;
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        // Attempt to set in Redis; ignore failures to keep service resilient
        await cache_1.cacheService.set('traffic', key, value, ttlSeconds);
        // Always set in memory cache for fast reuse
        memoryCache.set(key, { value, expiresAt });
    }
}
exports.TrafficCache = TrafficCache;
exports.trafficCache = new TrafficCache();
//# sourceMappingURL=traffic.cache.js.map