import { Result } from '../Result';
import { ValidationError } from '../errors';

/**
 * Search News Use Case
 * 
 * Business logic for searching news articles.
 * Handles query validation, search execution, and result filtering.
 * 
 * @example
 * const useCase = new SearchNewsUseCase(newsRepository);
 * const result = await useCase.execute('technology');
 * 
 * if (result.isSuccess()) {
 *   console.log(result.value); // Array of matching NewsEntity
 * }
 */
export class SearchNewsUseCase {
  /**
   * @param {INewsRepository} newsRepository - News repository instance
   */
  constructor(newsRepository) {
    this.newsRepository = newsRepository;
  }

  /**
   * Execute the search
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @param {string} [params.category] - Filter by category
   * @param {boolean} [params.published=true] - Filter by published status
   * @param {number} [params.limit] - Limit number of results
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with matching news or error
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

      // Set defaults
      const searchParams = {
        published: true,
        ...params,
      };

      // Execute search
      const result = await this.newsRepository.search(normalizedQuery, searchParams);

      if (result.isFailure()) {
        return result;
      }

      // Apply additional filtering and ranking
      let news = result.value;

      // Rank results by relevance
      news = this._rankResults(news, normalizedQuery);

      // Sort by relevance score, then by date
      news = this._sortResults(news);

      return Result.success(news);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Validate search query
   * @private
   * @param {string} query - Search query
   * @returns {Result} Success or ValidationError
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

    // Check minimum length after trimming
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
   * @param {string} query - Raw query
   * @returns {string} Normalized query
   */
  _normalizeQuery(query) {
    return query.trim().toLowerCase();
  }

  /**
   * Rank search results by relevance
   * @private
   * @param {Array<NewsEntity>} news - News array
   * @param {string} query - Search query
   * @returns {Array<NewsEntity>} News with relevance scores
   */
  _rankResults(news, query) {
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);

    return news.map(article => {
      let score = 0;

      // Title matches (highest weight)
      const titleLower = article.title.toLowerCase();
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) {
          score += 10;
          // Exact word match bonus
          if (titleLower.split(/\s+/).includes(term)) {
            score += 5;
          }
        }
      });

      // Category matches
      if (article.category) {
        const categoryLower = article.category.toLowerCase();
        queryTerms.forEach(term => {
          if (categoryLower.includes(term)) {
            score += 5;
          }
        });
      }

      // Content matches (lower weight)
      const contentLower = article.content.toLowerCase();
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          score += 1;
        }
      });

      // Tags matches
      if (article.tags && article.tags.length > 0) {
        const tagsLower = article.tags.map(tag => tag.toLowerCase());
        queryTerms.forEach(term => {
          if (tagsLower.some(tag => tag.includes(term))) {
            score += 3;
          }
        });
      }

      // Recency bonus (newer articles get slight boost)
      if (article.isRecent()) {
        score += 2;
      }

      // Attach score to article (non-mutating)
      return {
        ...article,
        _relevanceScore: score,
      };
    });
  }

  /**
   * Sort results by relevance and date
   * @private
   * @param {Array<NewsEntity>} news - News with relevance scores
   * @returns {Array<NewsEntity>} Sorted news array
   */
  _sortResults(news) {
    return [...news].sort((a, b) => {
      // First sort by relevance score
      const scoreDiff = (b._relevanceScore || 0) - (a._relevanceScore || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      // Then by date (newest first)
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }
}
