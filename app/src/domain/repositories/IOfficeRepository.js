import { Result } from '../Result';

/**
 * Office Repository Interface
 * 
 * Defines the contract for office/location data access.
 */
export class IOfficeRepository {
  /**
   * Get all offices
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.region] - Filter by region
   * @param {number} [params.limit] - Limit results
   * @param {number} [params.offset] - Offset for pagination
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async getAll(params = {}) {
    throw new Error('getAll method must be implemented');
  }

  /**
   * Get a single office by ID
   * @param {string} id - Office ID
   * @returns {Promise<Result<OfficeEntity>>}
   */
  async getById(id) {
    throw new Error('getById method must be implemented');
  }

  /**
   * Get offices by region
   * @param {string} region - Region name
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async getByRegion(region, params = {}) {
    throw new Error('getByRegion method must be implemented');
  }

  /**
   * Search offices
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async search(query, params = {}) {
    throw new Error('search method must be implemented');
  }

  /**
   * Invalidate cache
   * @returns {Promise<Result<boolean>>}
   */
  async invalidateCache() {
    throw new Error('invalidateCache method must be implemented');
  }
}
