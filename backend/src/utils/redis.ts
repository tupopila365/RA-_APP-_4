import { RedisClientType } from 'redis';
import { logger } from './logger';

/**
 * Wraps a Redis operation with a timeout to prevent hanging on slow networks
 * @param operation - The Redis operation function to execute
 * @param timeoutMs - Timeout in milliseconds (default: 2000ms)
 * @returns Promise that resolves with the operation result or rejects on timeout
 */
export async function withRedisTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 2000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Redis operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error: any) {
    if (error.message?.includes('timed out')) {
      logger.warn(`Redis operation timed out after ${timeoutMs}ms`);
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
export async function safeRedisDel(
  redisClient: RedisClientType | null,
  key: string,
  timeoutMs: number = 2000
): Promise<boolean> {
  if (!redisClient) {
    return false;
  }

  try {
    await withRedisTimeout(() => redisClient.del(key), timeoutMs);
    return true;
  } catch (error: any) {
    if (error.message?.includes('timed out')) {
      logger.warn(`Redis DEL operation timed out for key: ${key}`);
    } else {
      logger.error(`Redis DEL operation failed for key: ${key}`, error);
    }
    return false;
  }
}



















