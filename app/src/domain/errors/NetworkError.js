import { DomainError } from './DomainError';

/**
 * Network Error
 * 
 * Thrown when network requests fail. Used for API errors, timeouts,
 * connection issues, and server errors.
 * 
 * @example
 * catch (error) {
 *   throw new NetworkError('Failed to fetch data from server', {
 *     statusCode: 500,
 *     originalError: error
 *   });
 * }
 */
export class NetworkError extends DomainError {
  /**
   * @param {string} message - Error message
   * @param {Object} [metadata={}] - Additional error metadata (e.g., status code, URL)
   */
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = 'NetworkError';
    this.statusCode = metadata.statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }

  /**
   * Get a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    if (this.statusCode >= 500) {
      return 'Server error. Please try again later.';
    }
    if (this.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (this.statusCode === 401 || this.statusCode === 403) {
      return 'You are not authorized to access this resource.';
    }
    return 'Network error. Please check your connection and try again.';
  }

  /**
   * Check if this is a timeout error
   * @returns {boolean} True if this is a timeout error
   */
  isTimeout() {
    return this.metadata.timeout === true;
  }

  /**
   * Check if this is a server error (5xx)
   * @returns {boolean} True if this is a server error
   */
  isServerError() {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Check if this is a client error (4xx)
   * @returns {boolean} True if this is a client error
   */
  isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}
