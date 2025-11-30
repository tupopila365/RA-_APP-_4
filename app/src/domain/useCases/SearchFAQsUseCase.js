import { Result } from '../Result';
import { ValidationError } from '../errors';

/**
 * Search FAQs Use Case
 * 
 * Business logic for searching FAQs.
 */
export class SearchFAQsUseCase {
  /**
   * @param {IFAQRepository} faqRepository
   */
  constructor(faqRepository) {
    this.faqRepository = faqRepository;
  }

  /**
   * Execute the search
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async execute(query, params = {}) {
    try {
      // Validate query
      const validationResult = this._validateQuery(query);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // Normalize query
      const normalizedQuery = this._normalizeQuery(query);

      // If query is empty, return all FAQs
      if (!normalizedQuery) {
        const allResult = await this.faqRepository.getAll(params);
        if (allResult.isSuccess()) {
          return Result.success(this._sortByOrder(allResult.value));
        }
        return allResult;
      }

      // Execute search
      const result = await this.faqRepository.search(normalizedQuery, params);

      if (result.isFailure()) {
        return result;
      }

      // Rank and sort results
      let faqs = this._rankResults(result.value, normalizedQuery);
      faqs = this._sortResults(faqs);

      return Result.success(faqs);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Validate search query
   * @private
   */
  _validateQuery(query) {
    if (query === null || query === undefined) {
      return Result.failure(
        new ValidationError('Search query is required', {
          field: 'query',
          value: query,
        })
      );
    }

    if (typeof query !== 'string') {
      return Result.failure(
        new ValidationError('Search query must be a string', {
          field: 'query',
          value: query,
        })
      );
    }

    return Result.success(true);
  }

  /**
   * Normalize search query
   * @private
   */
  _normalizeQuery(query) {
    return query.trim().toLowerCase();
  }

  /**
   * Rank search results by relevance
   * @private
   */
  _rankResults(faqs, query) {
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);

    return faqs.map(faq => {
      let score = 0;

      // Question matches (highest weight)
      const questionLower = faq.question.toLowerCase();
      queryTerms.forEach(term => {
        if (questionLower.includes(term)) {
          score += 10;
          // Exact word match bonus
          if (questionLower.split(/\s+/).includes(term)) {
            score += 5;
          }
        }
      });

      // Answer matches
      const answerLower = faq.answer.toLowerCase();
      queryTerms.forEach(term => {
        if (answerLower.includes(term)) {
          score += 3;
        }
      });

      // Category matches
      if (faq.category) {
        const categoryLower = faq.category.toLowerCase();
        queryTerms.forEach(term => {
          if (categoryLower.includes(term)) {
            score += 5;
          }
        });
      }

      return {
        ...faq,
        _relevanceScore: score,
      };
    });
  }

  /**
   * Sort results by relevance and order
   * @private
   */
  _sortResults(faqs) {
    return [...faqs].sort((a, b) => {
      // First sort by relevance score
      const scoreDiff = (b._relevanceScore || 0) - (a._relevanceScore || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      // Then by order
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      // Finally by ID
      return a.id - b.id;
    });
  }

  /**
   * Sort by order only
   * @private
   */
  _sortByOrder(faqs) {
    return [...faqs].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.id - b.id;
    });
  }
}
