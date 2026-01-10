"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_1 = require("../config/redis");
const logger_1 = require("./logger");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Cache utility for Redis operations
 * Gracefully handles cases where Redis is not available
 */
class CacheService {
    /**
     * Generate a cache key from a string
     * Normalizes the input and creates a hash for consistent keys
     */
    generateKey(prefix, value) {
        // Normalize: lowercase, trim, remove extra spaces
        const normalized = value.toLowerCase().trim().replace(/\s+/g, ' ');
        // Create hash for consistent key length
        const hash = crypto_1.default.createHash('md5').update(normalized).digest('hex');
        return `cache:${prefix}:${hash}`;
    }
    /**
     * Get a value from cache
     * @param prefix - Cache key prefix (e.g., 'chatbot')
     * @param key - The key to look up
     * @returns Cached value or null if not found or Redis unavailable
     */
    async get(prefix, key) {
        const redisClient = (0, redis_1.getRedisClient)();
        if (!redisClient) {
            return null;
        }
        try {
            const cacheKey = this.generateKey(prefix, key);
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for ${prefix}: ${key.substring(0, 50)}...`);
                return JSON.parse(cached);
            }
            logger_1.logger.debug(`Cache miss for ${prefix}: ${key.substring(0, 50)}...`);
            return null;
        }
        catch (error) {
            logger_1.logger.warn(`Cache get error for ${prefix}:`, error.message);
            return null;
        }
    }
    /**
     * Set a value in cache
     * @param prefix - Cache key prefix (e.g., 'chatbot')
     * @param key - The key to store
     * @param value - The value to cache
     * @param ttlSeconds - Time to live in seconds (default: 3600 = 1 hour)
     * @returns true if successful, false otherwise
     */
    async set(prefix, key, value, ttlSeconds = 3600) {
        const redisClient = (0, redis_1.getRedisClient)();
        if (!redisClient) {
            return false;
        }
        try {
            const cacheKey = this.generateKey(prefix, key);
            const serialized = JSON.stringify(value);
            await redisClient.setEx(cacheKey, ttlSeconds, serialized);
            logger_1.logger.debug(`Cache set for ${prefix}: ${key.substring(0, 50)}... (TTL: ${ttlSeconds}s)`);
            return true;
        }
        catch (error) {
            logger_1.logger.warn(`Cache set error for ${prefix}:`, error.message);
            return false;
        }
    }
    /**
     * Delete a value from cache
     * @param prefix - Cache key prefix
     * @param key - The key to delete
     * @returns true if successful, false otherwise
     */
    async delete(prefix, key) {
        const redisClient = (0, redis_1.getRedisClient)();
        if (!redisClient) {
            return false;
        }
        try {
            const cacheKey = this.generateKey(prefix, key);
            await redisClient.del(cacheKey);
            logger_1.logger.debug(`Cache delete for ${prefix}: ${key.substring(0, 50)}...`);
            return true;
        }
        catch (error) {
            logger_1.logger.warn(`Cache delete error for ${prefix}:`, error.message);
            return false;
        }
    }
    /**
     * Delete all keys with a given prefix
     * @param prefix - Cache key prefix
     * @returns number of keys deleted
     */
    async deleteAll(prefix) {
        const redisClient = (0, redis_1.getRedisClient)();
        if (!redisClient) {
            return 0;
        }
        try {
            const pattern = `cache:${prefix}:*`;
            const keys = await redisClient.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            await redisClient.del(keys);
            logger_1.logger.info(`Cache cleared for prefix ${prefix}: ${keys.length} keys deleted`);
            return keys.length;
        }
        catch (error) {
            logger_1.logger.warn(`Cache deleteAll error for ${prefix}:`, error.message);
            return 0;
        }
    }
    /**
     * Check if Redis is available
     */
    isAvailable() {
        return (0, redis_1.getRedisClient)() !== null;
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.js.map