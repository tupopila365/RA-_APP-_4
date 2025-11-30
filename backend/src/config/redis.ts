import { createClient, RedisClientType } from 'redis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  // Skip Redis if not configured
  if (!env.REDIS_HOST || !env.REDIS_PORT || env.REDIS_HOST === '' || env.REDIS_PORT === 0) {
    logger.info('Redis not configured - skipping Redis connection');
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      password: env.REDIS_PASSWORD,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis Client Disconnected');
    });

    await redisClient.connect();

    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed through app termination');
      }
    });

    return redisClient;
  } catch (error) {
    logger.warn('Redis connection failed - continuing without Redis:', error);
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};
