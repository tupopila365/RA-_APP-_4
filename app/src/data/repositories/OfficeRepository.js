import { IOfficeRepository } from '../../domain/repositories/IOfficeRepository';
import { Result } from '../../domain/Result';
import { NetworkError } from '../../domain/errors';

/**
 * Office Repository Implementation
 * 
 * Implements the IOfficeRepository interface with caching support.
 */
export class OfficeRepository extends IOfficeRepository {
  /**
   * @param {OfficeApiDataSource} apiDataSource
   * @param {CacheDataSource} cacheDataSource
   * @param {OfficeMapper} mapper
   */
  constructor(apiDataSource, cacheDataSource, mapper) {
    super();
    this.apiDataSource = apiDataSource;
    this.cacheDataSource = cacheDataSource;
    this.mapper = mapper;
    
    this.CACHE_KEY_ALL = 'offices_all';
    this.CACHE_KEY_PREFIX = 'office_';
    this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes (offices change less frequently)
  }

  /**
   * Get all offices
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async getAll(params = {}) {
    try {
      const cacheKey = this._generateCacheKey('all', params);

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getOffices(params);
      
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
        new NetworkError('Failed to fetch offices', {
          originalError: error,
        })
      );
    }
  }

  /**
   * Get a single office by ID
   * @param {string} id - Office ID
   * @returns {Promise<Result<OfficeEntity>>}
   */
  async getById(id) {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getOfficeById(id);
      
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
        new NetworkError(`Failed to fetch office with ID ${id}`, {
          resourceId: id,
          originalError: error,
        })
      );
    }
  }

  /**
   * Get offices by region
   * @param {string} region - Region name
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async getByRegion(region, params = {}) {
    try {
      const cacheKey = this._generateCacheKey('region', { region, ...params });

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.getOfficesByRegion(region, params);
      
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
        new NetworkError(`Failed to fetch offices for region ${region}`, {
          region,
          originalError: error,
        })
      );
    }
  }

  /**
   * Search offices
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async search(query, params = {}) {
    try {
      const cacheKey = this._generateCacheKey('search', { query, ...params });

      // Try cache first
      const cacheResult = this.cacheDataSource.get(cacheKey);
      if (cacheResult.isSuccess()) {
        return Result.success(cacheResult.value);
      }

      // Fetch from API
      const apiResult = await this.apiDataSource.searchOffices(query, params);
      
      if (apiResult.isFailure()) {
        return apiResult;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(apiResult.value);

      // Cache the result (shorter TTL for search)
      this.cacheDataSource.set(cacheKey, entities, this.CACHE_TTL / 2);

      return Result.success(entities);
    } catch (error) {
      return Result.failure(
        new NetworkError('Failed to search offices', {
          query,
          originalError: error,
        })
      );
    }
  }

  /**
   * Invalidate cache
   * @returns {Promise<Result<boolean>>}
   */
  async invalidateCache() {
    try {
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
   * Generate cache key
   * @private
   */
  _generateCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${this.CACHE_KEY_PREFIX}${operation}_${sortedParams}`;
  }
}
