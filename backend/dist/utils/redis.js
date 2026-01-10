"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRedisTimeout = withRedisTimeout;
exports.safeRedisDel = safeRedisDel;
const logger_1 = require("./logger");
/**
 * Wraps a Redis operation with a timeout to prevent hanging on slow networks
 * @param operation - The Redis operation function to execute
 * @param timeoutMs - Timeout in milliseconds (default: 2000ms)
 * @returns Promise that resolves with the operation result or rejects on timeout
 */
async function withRedisTimeout(operation, timeoutMs = 2000) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Redis operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    try {
        return await Promise.race([operation(), timeoutPromise]);
    }
    catch (error) {
        if (error.message?.includes('timed out')) {
            logger_1.logger.warn(`Redis operation timed out after ${timeoutMs}ms`);
            throw error;
        }
        throw error;
    }
}
/**
 * Safely delete a Redis key with timeout protection
 * @param redisClient - Redis client instance
 * @param key - Key to delete
 * @param timeoutMs - Timeout in milliseconds (default: 2000ms)
 * @returns Promise that resolves to true if deleted, false if timeout/error
 */
async function safeRedisDel(redisClient, key, timeoutMs = 2000) {
    if (!redisClient) {
        return false;
    }
    try {
        await withRedisTimeout(() => redisClient.del(key), timeoutMs);
        return true;
    }
    catch (error) {
        if (error.message?.includes('timed out')) {
            logger_1.logger.warn(`Redis DEL operation timed out for key: ${key}`);
        }
        else {
            logger_1.logger.error(`Redis DEL operation failed for key: ${key}`, error);
        }
        return false;
    }
}
//# sourceMappingURL=redis.js.map