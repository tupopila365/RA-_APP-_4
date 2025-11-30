import { Result } from '../Result';
import { ValidationError } from '../errors';

/**
 * Get News Use Case
 * 
 * Business logic for retrieving news articles.
 * Handles validation, filtering, and orchestrates repository calls.
 * 
 * @example
 * const useCase = new GetNewsUseCase(newsRepository);
 * const result = await useCase.execute({ published: true });
 * 
 * if (result.isSuccess()) {
 *   console.log(result.value); // Array of NewsEntity
 * }
 */
export class GetNewsUseCase {
  /**
   * @param {INewsRepository} newsRepository - News repository instance
   */
  constructor(newsRepository) {
    this.newsRepository = newsRepository;
  }

  /**
   * Execute the use case
   * @param {Object} [params={}] - Query parameters
   * @param {boolean} [params.published=true] - Filter by published status
   * @param {string} [params.category] - Filter by category
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.offset] - Offset for pagination
   * @param {boolean} [params.forceRefresh=false] - Force refresh from API
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async execute(params = {}) {
    try {
      // Validate parameters
      const validationResult = this._validateParams(params);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // Set defaults
      const queryParams = {
        published: true,
        ...params,
      };

      // Force refresh if requested
      if (params.forceRefresh) {
        await this.newsRepository.invalidateCache();
      }

      // Fetch news from repository
      const result = await this.newsRepository.getAll(queryParams);

      if (result.isFailure()) {
        return result;
      }

      // Apply additional filtering if needed
      let news = result.value;

      // Sort by published date (newest first)
      news = this._sortByDate(news);

      return Result.success(news);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get a single news article by ID
   * @param {number} id - News article ID
   * @returns {Promise<Result<NewsEntity>>} Result with news entity or error
   */
  async getById(id) {
    try {
      // Validate ID
      if (!id || typeof id !== 'number') {
        return Result.failure(
          new ValidationError('Invalid news ID', {
            field: 'id',
            value: id,
          })
        );
      }

      return await this.newsRepository.getById(id);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get news by category
   * @param {string} category - Category name
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<NewsEntity>>>} Result with news array or error
   */
  async getByCategory(category, params = {}) {
    try {
      // Validate category
      if (!category || typeof category !== 'string') {
        return Result.failure(
          new ValidationError('Invalid category', {
            field: 'category',
            value: category,
          })
        );
      }

      const result = await this.newsRepository.getByCategory(category, params);

      if (result.isFailure()) {
        return result;
      }

      // Sort by date
      const news = this._sortByDate(result.value);

      return Result.success(news);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Validate query parameters
   * @private
   * @param {Object} params - Parameters to validate
   * @returns {Result} Success or ValidationError
   */
  _validateParams(params) {
    // Validate limit
    if (params.limit !== undefined) {
      if (typeof params.limit !== 'number' || params.limit < 1) {
        return Result.failure(
          new ValidationError('Limit must be a positive number', {
            field: 'limit',
            value: params.limit,
          })
        );
      }
    }

    // Validate offset
    if (params.offset !== undefined) {
      if (typeof params.offset !== 'number' || params.offset < 0) {
        return Result.failure(
          new ValidationError('Offset must be a non-negative number', {
            field: 'offset',
            value: params.offset,
          })
        );
      }
    }

    return Result.success(true);
  }

  /**
   * Sort news by published date (newest first)
   * @private
   * @param {Array<NewsEntity>} news - News array
   * @returns {Array<NewsEntity>} Sorted news array
   */
  _sortByDate(news) {
    return [...news].sort((a, b) => {
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }
}
