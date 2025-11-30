import { Result } from '../Result';

/**
 * Get FAQs Use Case
 * 
 * Business logic for retrieving FAQs.
 */
export class GetFAQsUseCase {
  /**
   * @param {IFAQRepository} faqRepository
   */
  constructor(faqRepository) {
    this.faqRepository = faqRepository;
  }

  /**
   * Execute the use case
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.category] - Filter by category
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async execute(params = {}) {
    try {
      const result = await this.faqRepository.getAll(params);

      if (result.isFailure()) {
        return result;
      }

      // Sort by order, then by ID
      let faqs = this._sortFAQs(result.value);

      return Result.success(faqs);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get a single FAQ by ID
   * @param {number} id - FAQ ID
   * @returns {Promise<Result<FAQEntity>>}
   */
  async getById(id) {
    try {
      return await this.faqRepository.getById(id);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Sort FAQs by order, then by ID
   * @private
   */
  _sortFAQs(faqs) {
    return [...faqs].sort((a, b) => {
      // First sort by order
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      // Then by ID
      return a.id - b.id;
    });
  }
}
