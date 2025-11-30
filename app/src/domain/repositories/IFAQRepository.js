import { Result } from '../Result';

/**
 * FAQ Repository Interface
 * 
 * Defines the contract for FAQ data access.
 */
export class IFAQRepository {
  /**
   * Get all FAQs
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.category] - Filter by category
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async getAll(params = {}) {
    throw new Error('getAll method must be implemented');
  }

  /**
   * Get a single FAQ by ID
   * @param {number} id - FAQ ID
   * @returns {Promise<Result<FAQEntity>>}
   */
  async getById(id) {
    throw new Error('getById method must be implemented');
  }

  /**
   * Search FAQs
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async search(query, params = {}) {
    throw new Error('search method must be implemented');
  }
}
