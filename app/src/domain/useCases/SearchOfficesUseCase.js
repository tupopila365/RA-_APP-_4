import { Result } from '../Result';
import { ValidationError } from '../errors';

/**
 * Search Offices Use Case
 * 
 * Business logic for searching office locations.
 */
export class SearchOfficesUseCase {
  /**
   * @param {IOfficeRepository} officeRepository
   */
  constructor(officeRepository) {
    this.officeRepository = officeRepository;
  }

  /**
   * Execute the search
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @param {string} [params.region] - Filter by region
   * @returns {Promise<Result<Array<OfficeEntity>>>}
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

      // If query is empty after normalization, return empty array
      if (!normalizedQuery) {
        return Result.success([]);
      }

      // Execute search
      const result = await this.officeRepository.search(normalizedQuery, params);

      if (result.isFailure()) {
        return result;
      }

      // Rank and sort results
      let offices = this._rankResults(result.value, normalizedQuery);
      offices = this._sortResults(offices);

      return Result.success(offices);
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

    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      return Result.failure(
        new ValidationError('Search query must be at least 2 characters', {
          field: 'query',
          value: query,
          minLength: 2,
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
  _rankResults(offices, query) {
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);

    return offices.map(office => {
      let score = 0;

      // Name matches (highest weight)
      const nameLower = office.name.toLowerCase();
      queryTerms.forEach(term => {
        if (nameLower.includes(term)) {
          score += 10;
          // Exact word match bonus
          if (nameLower.split(/\s+/).includes(term)) {
            score += 5;
          }
        }
      });

      // Region matches
      const regionLower = office.region.toLowerCase();
      queryTerms.forEach(term => {
        if (regionLower.includes(term)) {
          score += 8;
        }
      });

      // Address matches
      const addressLower = office.address.toLowerCase();
      queryTerms.forEach(term => {
        if (addressLower.includes(term)) {
          score += 3;
        }
      });

      return {
        ...office,
        _relevanceScore: score,
      };
    });
  }

  /**
   * Sort results by relevance and name
   * @private
   */
  _sortResults(offices) {
    return [...offices].sort((a, b) => {
      // First sort by relevance score
      const scoreDiff = (b._relevanceScore || 0) - (a._relevanceScore || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      // Then by name
      return a.name.localeCompare(b.name);
    });
  }
}
