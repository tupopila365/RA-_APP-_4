import { DomainError } from './DomainError';

/**
 * Validation Error
 * 
 * Thrown when input validation fails. Used for invalid user input,
 * malformed data, or business rule violations.
 * 
 * @example
 * if (!query || query.trim().length === 0) {
 *   throw new ValidationError('Search query cannot be empty');
 * }
 */
export class ValidationError extends DomainError {
  /**
   * @param {string} message - Error message
   * @param {Object} [metadata={}] - Additional error metadata (e.g., field name, validation rules)
   */
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = 'ValidationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    return this.message; // Validation errors are already user-friendly
  }
}
