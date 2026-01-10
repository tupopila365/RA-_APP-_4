/**
 * Cache utility for Redis operations
 * Gracefully handles cases where Redis is not available
 */
declare class CacheService {
    /**
     * Generate a cache key from a string
     * Normalizes the input and creates a hash for consistent keys
     */
    private generateKey;
    /**
     * Get a value from cache
     * @param prefix - Cache key prefix (e.g., 'chatbot')
     * @param key - The key to look up
     * @returns Cached value or null if not found or Redis unavailable
     */
    get<T>(prefix: string, key: string): Promise<T | null>;
    /**
     * Set a value in cache
     * @param prefix - Cache key prefix (e.g., 'chatbot')
     * @param key - The key to store
     * @param value - The value to cache
     * @param ttlSeconds - Time to live in seconds (default: 3600 = 1 hour)
     * @returns true if successful, false otherwise
     */
    set<T>(prefix: string, key: string, value: T, ttlSeconds?: number): Promise<boolean>;
    /**
     * Delete a value from cache
     * @param prefix - Cache key prefix
     * @param key - The key to delete
     * @returns true if successful, false otherwise
     */
    delete(prefix: string, key: string): Promise<boolean>;
    /**
     * Delete all keys with a given prefix
     * @param prefix - Cache key prefix
     * @returns number of keys deleted
     */
    deleteAll(prefix: string): Promise<number>;
    /**
     * Check if Redis is available
     */
    isAvailable(): boolean;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cache.d.ts.map