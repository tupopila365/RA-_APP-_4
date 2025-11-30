import { INewsRepository } from '../../domain/repositories/INewsRepository';
import { Result } from '../../domain/Result';
import { NetworkError } from '../../domain/errors';

/**
 * News Repository Implementation
 * 
 * Implements the INewsRepository interface with caching support.
 * Coordinates between API data source, cache, and mapper.
 * 
 * @example
 * const repository = new NewsRepository(apiDataSource, cacheDataSource, mapper);
 * const result = await repository.getAll({ published: true });
 * 
 * if (result.isSuccess()) {
 *   console.log(result.value); // Array of NewsEntity
 * }
 */
export class NewsRepository extends INewsRepository {
  /**
   * @param {NewsApiDataSource} apiDataSource - API data source
   * @param {CacheDataSource} cacheDataSource - Cache data source
   * @param {NewsMapper} mapper - News mapper
   */
  constructor(apiDataSource, cacheDataSource, mapper) {
    super();
    this.apiDataSource = apiDataSource;
    this.cacheDataSource = cacheDataSource;
    this.mapper = mapper;
    
    // Cache keys
    this.CACHE_KEY_ALL = 'news_all';
    this.CACHE_KEY_PREFIX = 'news_';
    
    // Cache TTL: 5 minutes
    this.CACHE_TTL = 5 * 60 * 1000;
  }

  /**
   * Get all news articles
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async getAll(params = {}) {
    try {
      // Generate cache key based on params
      const cacheKey = this._generateCacheKey('all', params);

      // Try to get from cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getNews(params);
      
      if (apiResult.isFailure()) {
        return apiResult;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(apiResult.value);

      // Cache the result
      this.cacheDataSource.set(cacheKey, entities, this.CACHE_TTL);

      return Result.success(entities);
    } catch (error) {
      return Result.failure(
        new NetworkError('Failed to fetch news', {
          originalError: error,
        })
      );
    }
  }

  /**
   * Get a single news article by ID
   * @param {number} id - News article ID
   * @returns {Promise<Result<NewsEntity>>} Result with news entity or error
   */
  async getById(id) {
    try {
      // Generate cache key
      const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getNewsById(id);
      
      if (apiResult.isFailure()) {
        return apiResult;
      }

      // Map DTO to entity
      const entity = this.mapper.toEntity(apiResult.value);

      // Cache the result
      this.cacheDataSource.set(cacheKey, entity, this.CACHE_TTL);

      return Result.success(entity);
    } catch (error) {
      return Result.failure(
        new NetworkError(`Failed to fetch news with ID ${id}`, {
          resourceId: id,
          originalError: error,
        })
      );
    }
  }

  /**
   * Search news articles
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with matching news or error
   */
  async search(query, params = {}) {
    try {
      // Generate cache key
      const cacheKey = this._generateCacheKey('search', { query, ...params });

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.searchNews(query, params);
      
      if (apiResult.isFailure()) {
        return apiResult;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(apiResult.value);

      // Cache the result (shorter TTL for search results)
      this.cacheDataSource.set(cacheKey, entities, this.CACHE_TTL / 2);

      return Result.success(entities);
    } catch (error) {
      return Result.failure(
        new NetworkError('Failed to search news', {
          query,
          originalError: error,
        })
      );
    }
  }

  /**
   * Get news articles by category
   * @param {string} category - Category name
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async getByCategory(category, params = {}) {
    try {
      // Generate cache key
      const cacheKey = this._generateCacheKey('category', { category, ...params });

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getNewsByCategory(category, params);
      
      if (apiResult.isFailure()) {
        return apiResult;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(apiResult.value);

      // Cache the result
      this.cacheDataSource.set(cacheKey, entities, this.CACHE_TTL);

      return Result.success(entities);
    } catch (error) {
      return Result.failure(
        new NetworkError(`Failed to fetch news for category ${category}`, {
          category,
          originalError: error,
        })
      );
    }
  }

  /**
   * Invalidate cache for news data
   * @returns {Promise<Result<boolean>>} Result indicating success
   */
  async invalidateCache() {
    try {
      // Clear all news-related cache entries
      const stats = this.cacheDataSource.getStats();
      let clearedCount = 0;

      // Get all cache keys and clear news-related ones
      // Since we don't have direct access to keys, we'll use cleanup
      // which removes expired entries, or we clear everything
      const clearResult = this.cacheDataSource.clear();

      if (clearResult.isFailure()) {
        return clearResult;
      }

      return Result.success(true);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Generate cache key based on operation and parameters
   * @private
   * @param {string} operation - Operation type (all, search, category)
   * @param {Object} params - Parameters
   * @returns {string} Cache key
   */
  _generateCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${this.CACHE_KEY_PREFIX}${operation}_${sortedParams}`;
  }
}
