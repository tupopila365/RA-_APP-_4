import { ApiDataSource } from './ApiDataSource';
import { Result } from '../../domain/Result';
import ENV from '../../../config/env';

/**
 * Office API Data Source
 * 
 * Handles all HTTP requests related to office locations.
 */
export class OfficeApiDataSource extends ApiDataSource {
  constructor() {
    super(ENV.API_BASE_URL, {
      timeout: ENV.API_TIMEOUT || 10000,
      retries: 3,
      retryDelay: 1000,
    });
  }

  /**
   * Get all offices
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Result>}
   */
  async getOffices(params = {}) {
    const result = await this.get('locations', params);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { locations: [], pagination: {} } }
    const responseData = result.value;
    const data = responseData.data?.locations || responseData.locations || responseData.data || responseData;
    return Result.success(Array.isArray(data) ? data : []);
  }

  /**
   * Get a single office by ID
   * @param {string} id - Office ID
   * @returns {Promise<Result>}
   */
  async getOfficeById(id) {
    const result = await this.get(`locations/${id}`);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { location: {...} } }
    const responseData = result.value;
    const data = responseData.data?.location || responseData.location || responseData.data || responseData;
    return Result.success(data);
  }

  /**
   * Get offices by region
   * @param {string} region - Region name
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result>}
   */
  async getOfficesByRegion(region, params = {}) {
    return this.getOffices({
      region,
      ...params,
    });
  }

  /**
   * Search offices
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result>}
   */
  async searchOffices(query, params = {}) {
    return this.getOffices({
      search: query,
      ...params,
    });
  }
}
