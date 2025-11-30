import { DomainError } from './DomainError';

/**
 * Not Found Error
 * 
 * Thrown when a requested resource cannot be found. Used for missing
 * entities, invalid IDs, or non-existent data.
 * 
 * @example
 * const news = await repository.getById(id);
 * if (!news) {
 *   throw new NotFoundError(`News article with ID ${id} not found`);
 * }
 */
export class NotFoundError extends DomainError {
  /**
   * @param {string} message - Error message
   * @param {Object} [metadata={}] - Additional error metadata (e.g., resource type, ID)
   */
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = 'NotFoundError';
    this.resourceType = metadata.resourceType;
    this.resourceId = metadata.resourceId;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }

  /**
   * Get a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    if (this.resourceType) {
      return `${this.resourceType} not found.`;
    }
    return 'The requested item was not found.';
  }
}
