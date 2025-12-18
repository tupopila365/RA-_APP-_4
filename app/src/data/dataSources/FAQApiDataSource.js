import { ApiDataSource } from './ApiDataSource';
import { Result } from '../../domain/Result';
import ENV from '../../../config/env';

/**
 * FAQ API Data Source
 * 
 * Handles all HTTP requests related to FAQs.
 * Extends ApiDataSource to inherit retry logic, error handling, and timeout management.
 * 
 * @example
 * const dataSource = new FAQApiDataSource();
 * const result = await dataSource.getFAQs({ category: 'Licensing' });
 * 
 * if (result.isSuccess()) {
 *   console.log(result.value); // Array of FAQ DTOs
 * }
 */
export class FAQApiDataSource extends ApiDataSource {
  constructor() {
    super(ENV.API_BASE_URL, {
      timeout: ENV.API_TIMEOUT || 10000,
      retries: 3,
      retryDelay: 1000,
    });
  }

  /**
   * Get all FAQs
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.search] - Search query
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.page] - Page number for pagination
   * @returns {Promise<Result>} Result with FAQ DTOs array or error
   */
  async getFAQs(params = {}) {
    const result = await this.get('faqs', params);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { faqs: [], pagination: {} } }
    const responseData = result.value;
    const data = responseData.data?.faqs || responseData.faqs || responseData.data || responseData;

    return Result.success(Array.isArray(data) ? data : []);
  }

  /**
   * Get a single FAQ by ID
   * @param {string} id - FAQ ID
   * @returns {Promise<Result>} Result with FAQ DTO or error
   */
  async getFAQById(id) {
    const result = await this.get(`faqs/${id}`);

    if (result.isFailure()) {
      return result;
    }

    // Handle nested response format from backend
    // Backend returns: { success, data: { faq: {...} } }
    const responseData = result.value;
    const data = responseData.data?.faq || responseData.faq || responseData.data || responseData;

    return Result.success(data);
  }

  /**
   * Search FAQs
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional query parameters
   * @returns {Promise<Result>} Result with matching FAQ DTOs or error
   */
  async searchFAQs(query, params = {}) {
    return this.getFAQs({
      search: query,
      ...params,
    });
  }
}

