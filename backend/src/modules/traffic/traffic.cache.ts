import { cacheService } from '../../utils/cache';
import { logger } from '../../utils/logger';
import { TrafficStatusResponse } from './traffic.types';

type CacheEntry = {
  value: TrafficStatusResponse;
  expiresAt: number;
};

// Lightweight in-memory cache to reduce Redis dependency for short-lived traffic data
const memoryCache = new Map<string, CacheEntry>();

export class TrafficCache {
  async get(key: string): Promise<TrafficStatusResponse | null> {
    const now = Date.now();

    // Try Redis first (if configured)
    const redisValue = await cacheService.get<TrafficStatusResponse>('traffic', key);
    if (redisValue) {
      return redisValue;
    }

    // Fallback to local memory cache
    const entry = memoryCache.get(key);
    if (entry && entry.expiresAt > now) {
      logger.debug(`Traffic cache hit (memory) for key ${key}`);
      return entry.value;
    }

    if (entry) {
      memoryCache.delete(key);
    }

    logger.debug(`Traffic cache miss for key ${key}`);
    return null;
  }

  async set(key: string, value: TrafficStatusResponse, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;

    // Attempt to set in Redis; ignore failures to keep service resilient
    await cacheService.set('traffic', key, value, ttlSeconds);

    // Always set in memory cache for fast reuse
    memoryCache.set(key, { value, expiresAt });
  }
}

export const trafficCache = new TrafficCache();













