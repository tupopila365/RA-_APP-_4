import { Result } from '../Result';

/**
 * News Repository Interface
 * 
 * Defines the contract for news data access.
 * Implementations should handle data fetching, caching, and error handling.
 * 
 * @interface
 */
export class INewsRepository {
  /**
   * Get all news articles
   * @param {Object} [params={}] - Query parameters
   * @param {boolean} [params.published=true] - Filter by published status
   * @param {string} [params.category] - Filter by category
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.offset] - Offset for pagination
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async getAll(params = {}) {
    throw new Error('getAll method must be implemented');
  }

  /**
   * Get a single news article by ID
   * @param {number} id - News article ID
   * @returns {Promise<Result<NewsEntity>>} Result with news entity or error
   */
  async getById(id) {
    throw new Error('getById method must be implemented');
  }

  /**
   * Search news articles
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with matching news or error
   */
  async search(query, params = {}) {
    throw new Error('search method must be implemented');
  }

  /**
   * Get news articles by category
   * @param {string} category - Category name
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async getByCategory(category, params = {}) {
    throw new Error('getByCategory method must be implemented');
  }

  /**
   * Invalidate cache for news data
   * @returns {Promise<Result<boolean>>} Result indicating success
   */
  async invalidateCache() {
    throw new Error('invalidateCache method must be implemented');
  }
}
