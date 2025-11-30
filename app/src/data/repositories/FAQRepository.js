import { IFAQRepository } from '../../domain/repositories/IFAQRepository';
import { Result } from '../../domain/Result';

/**
 * FAQ Repository Implementation
 * 
 * Implements the IFAQRepository interface.
 * Currently uses static data source, but can be extended to use API.
 */
export class FAQRepository extends IFAQRepository {
  /**
   * @param {FAQStaticDataSource} dataSource
   * @param {FAQMapper} mapper
   */
  constructor(dataSource, mapper) {
    super();
    this.dataSource = dataSource;
    this.mapper = mapper;
  }

  /**
   * Get all FAQs
   * @param {Object} [params={}] - Query parameters
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async getAll(params = {}) {
    try {
      const result = await this.dataSource.getFAQs(params);
      
      if (result.isFailure()) {
        return result;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(result.value);

      return Result.success(entities);
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
      const result = await this.dataSource.getFAQById(id);
      
      if (result.isFailure()) {
        return result;
      }

      // Map DTO to entity
      const entity = this.mapper.toEntity(result.value);

      return Result.success(entity);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Search FAQs
   * @param {string} query - Search query
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<FAQEntity>>>}
   */
  async search(query, params = {}) {
    try {
      const result = await this.dataSource.searchFAQs(query, params);
      
      if (result.isFailure()) {
        return result;
      }

      // Map DTOs to entities
      const entities = this.mapper.toEntityList(result.value);

      return Result.success(entities);
    } catch (error) {
      return Result.failure(error);
    }
  }
}
