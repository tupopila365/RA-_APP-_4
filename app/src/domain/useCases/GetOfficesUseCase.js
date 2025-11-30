import { Result } from '../Result';
import { ValidationError } from '../errors';

/**
 * Get Offices Use Case
 * 
 * Business logic for retrieving office locations.
 */
export class GetOfficesUseCase {
  /**
   * @param {IOfficeRepository} officeRepository
   */
  constructor(officeRepository) {
    this.officeRepository = officeRepository;
  }

  /**
   * Execute the use case
   * @param {Object} [params={}] - Query parameters
   * @param {string} [params.region] - Filter by region
   * @param {number} [params.limit] - Limit results
   * @param {number} [params.offset] - Offset for pagination
   * @param {boolean} [params.forceRefresh=false] - Force refresh from API
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async execute(params = {}) {
    try {
      // Validate parameters
      const validationResult = this._validateParams(params);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // Force refresh if requested
      if (params.forceRefresh) {
        await this.officeRepository.invalidateCache();
      }

      // Fetch offices
      const result = await this.officeRepository.getAll(params);

      if (result.isFailure()) {
        return result;
      }

      // Sort by region, then by name
      let offices = this._sortOffices(result.value);

      return Result.success(offices);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get a single office by ID
   * @param {string} id - Office ID
   * @returns {Promise<Result<OfficeEntity>>}
   */
  async getById(id) {
    try {
      if (!id || typeof id !== 'string') {
        return Result.failure(
          new ValidationError('Invalid office ID', {
            field: 'id',
            value: id,
          })
        );
      }

      return await this.officeRepository.getById(id);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Get offices by region
   * @param {string} region - Region name
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Result<Array<OfficeEntity>>>}
   */
  async getByRegion(region, params = {}) {
    try {
      if (!region || typeof region !== 'string') {
        return Result.failure(
          new ValidationError('Invalid region', {
            field: 'region',
            value: region,
          })
        );
      }

      const result = await this.officeRepository.getByRegion(region, params);

      if (result.isFailure()) {
        return result;
      }

      // Sort by name
      const offices = this._sortByName(result.value);

      return Result.success(offices);
    } catch (error) {
      return Result.failure(error);
    }
  }

  /**
   * Validate query parameters
   * @private
   */
  _validateParams(params) {
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
   * Sort offices by region, then by name
   * @private
   */
  _sortOffices(offices) {
    return [...offices].sort((a, b) => {
      // First sort by region
      const regionCompare = a.region.localeCompare(b.region);
      if (regionCompare !== 0) {
        return regionCompare;
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Sort offices by name
   * @private
   */
  _sortByName(offices) {
    return [...offices].sort((a, b) => a.name.localeCompare(b.name));
  }
}
