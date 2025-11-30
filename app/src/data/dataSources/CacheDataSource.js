import { Result } from '../../domain/Result';
import { NotFoundError } from '../../domain/errors';

/**
 * Cache Data Source
 * 
 * Provides in-memory caching with TTL (Time To Live) support.
 * Used to cache API responses and reduce network requests.
 */
export class CacheDataSource {
  constructor(defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.timers = new Map();
  }

  set(key, data, ttl = this.defaultTTL) {
    try {
      this._clearTimer(key);

      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      this.cache.set(key, cacheEntry);

      if (ttl > 0) {
        const timer = setTimeout(() => {
          this.delete(key);
        }, ttl);
        this.timers.set(key, timer);
      }

      return Result.success(true);
    } catch (error) {
      return Result.failure(error);
    }
  }

  get(key) {
    try {
      const cacheEntry = this.cache.get(key);

      if (!cacheEntry) {
        return Result.failure(
          new NotFoundError(`Cache entry '${key}' not found`, {
            resourceType: 'CacheEntry',
            resourceId: key,
          })
        );
      }

      const now = Date.now();
      const age = now - cacheEntry.timestamp;

      if (cacheEntry.ttl > 0 && age > cacheEntry.ttl) {
        this.delete(key);
        return Result.failure(
          new NotFoundError(`Cache entry '${key}' has expired`, {
            resourceType: 'CacheEntry',
            resourceId: key,
            expired: true,
          })
        );
      }

      return Result.success(cacheEntry.data);
    } catch (error) {
      return Result.failure(error);
    }
  }

  has(key) {
    const result = this.get(key);
    return result.isSuccess();
  }

  delete(key) {
    try {
      this._clearTimer(key);
      const existed = this.cache.delete(key);
      return Result.success(existed);
    } catch (error) {
      return Result.failure(error);
    }
  }

  clear() {
    try {
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.timers.clear();
      this.cache.clear();
      return Result.success(true);
    } catch (error) {
      return Result.failure(error);
    }
  }

  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();

    const stats = {
      totalEntries: entries.length,
      validEntries: 0,
      expiredEntries: 0,
    };

    entries.forEach(([key, entry]) => {
      const age = now - entry.timestamp;
      const isExpired = entry.ttl > 0 && age > entry.ttl;

      if (isExpired) {
        stats.expiredEntries++;
      } else {
        stats.validEntries++;
      }
    });

    return stats;
  }

  _clearTimer(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
}

export const globalCache = new CacheDataSource();
