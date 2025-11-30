/**
 * Base Domain Error
 * 
 * Base class for all domain-specific errors. Extends the native Error class
 * to provide consistent error handling across the application.
 * 
 * @example
 * throw new DomainError('Something went wrong in the domain layer');
 */
export class DomainError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} [metadata={}] - Additional error metadata
   */
  constructor(message, metadata = {}) {
    super(message);
    this.name = 'DomainError';
    this.metadata = metadata;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  /**
   * Get a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    return 'An error occurred. Please try again.';
  }

  /**
   * Convert error to JSON for logging
   * @returns {Object} JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}
