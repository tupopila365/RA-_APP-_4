"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
let redisClient = null;
const connectRedis = async () => {
    // Skip Redis if not configured
    if (!env_1.env.REDIS_HOST || !env_1.env.REDIS_PORT || env_1.env.REDIS_HOST === '' || env_1.env.REDIS_PORT === 0) {
        logger_1.logger.info('Redis not configured - skipping Redis connection');
        return null;
    }
    if (redisClient) {
        return redisClient;
    }
    try {
        redisClient = (0, redis_1.createClient)({
            socket: {
                host: env_1.env.REDIS_HOST,
                port: env_1.env.REDIS_PORT,
            },
            password: env_1.env.REDIS_PASSWORD,
        });
        redisClient.on('error', (err) => {
            logger_1.logger.error('Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
            logger_1.logger.info('Redis Client Connected');
        });
        redisClient.on('ready', () => {
            logger_1.logger.info('Redis Client Ready');
        });
        redisClient.on('end', () => {
            logger_1.logger.warn('Redis Client Disconnected');
        });
        await redisClient.connect();
        process.on('SIGINT', async () => {
            if (redisClient) {
                await redisClient.quit();
                logger_1.logger.info('Redis connection closed through app termination');
            }
        });
        return redisClient;
    }
    catch (error) {
        logger_1.logger.warn('Redis connection failed - continuing without Redis:', error);
        return null;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map