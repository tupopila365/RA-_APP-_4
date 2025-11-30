import { ApiDataSource } from './ApiDataSource';
import { Result } from '../../domain/Result';
import ENV from '../../../config/env';

/**
 * News API Data Source
 * 
 * Handles all HTTP requests related to news articles.
 * Extends ApiDataSource to inherit retry logic, error handling, and timeout management.
 * 
 * @example
 * const dataSource = new NewsApiDataSource();
 * const result = await dataSource.getNews({ published: true });
 * 
 * if (result.isSuccess()) {
 *   console.log(result.value); // Array of news DTOs
 * }
 */
export class NewsApiDataSource extends ApiDataSource {
  constructor() {
    super(ENV.API_BASE_URL, {
      timeout: ENV.API_TIMEOUT || 10000,
      retries: 3,
      retryDelay: 1000,
    });
  }

  /**
   * Get all news articles
   * @param {Object} [params={}] - Query parameters
   * @param {boolean} [params.published] - Filter by published status
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.search] - Search query
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.offset] - Offset for pagination
   * @returns {Promise<Result>} Result with news DTOs array or error
   */
  async getNews(params = {}) {
    const result = await this.get('news', params);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { news: [], pagination: {} } }
    const responseData = result.value;
    const data = responseData.data?.news || responseData.news || responseData.data || responseData;

    return Result.success(Array.isArray(data) ? data : []);
  }

  /**
   * Get a single news article by ID
   * @param {number} id - News article ID
   * @returns {Promise<Result>} Result with news DTO or error
   */
  async getNewsById(id) {
    const result = await this.get(`news/${id}`);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { news: {...} } }
    const responseData = result.value;
    const data = responseData.data?.news || responseData.news || responseData.data || responseData;

    return Result.success(data);
  }

  /**
   * Search news articles
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result>} Result with matching news DTOs or error
   */
  async searchNews(query, params = {}) {
    return this.getNews({
      search: query,
      ...params,
    });
  }

  /**
   * Get news by category
   * @param {string} category - Category name
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result>} Result with news DTOs array or error
   */
  async getNewsByCategory(category, params = {}) {
    return this.getNews({
      category,
      ...params,
    });
  }
}
