import { RedisClientType } from 'redis';
/**
 * Wraps a Redis operation with a timeout to prevent hanging on slow networks
 * @param operation - The Redis operation function to execute
 * @param timeoutMs - Timeout in milliseconds (default: 2000ms)
 * @returns Promise that resolves with the operation result or rejects on timeout
 */
export declare function withRedisTimeout<T>(operation: () => Promise<T>, timeoutMs?: number): Promise<T>;
/**
 * Safely delete a Redis key with timeout protection
 * @param redisClient - Redis client instance
 * @param key - Key to delete
 * @param timeoutMs - Timeout in milliseconds (default: 2000ms)
 * @returns Promise that resolves to true if deleted, false if timeout/error
 */
export declare function safeRedisDel(redisClient: RedisClientType | null, key: string, timeoutMs?: number): Promise<boolean>;
//# sourceMappingURL=redis.d.ts.map