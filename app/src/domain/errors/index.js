/**
 * Domain Errors
 * 
 * This module exports all domain error classes for use throughout the application.
 * These errors provide a consistent way to handle different error scenarios.
 */

export { DomainError } from './DomainError';
export { ValidationError } from './ValidationError';
export { NetworkError } from './NetworkError';
export { NotFoundError } from './NotFoundError';

/**
 * Error Utilities
 */

/**
 * Check if an error is a domain error
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is a domain error
 */
export function isDomainError(error) {
  return error && error.name && error.name.endsWith('Error');
}

/**
 * Get a user-friendly message from any error
 * @param {Error} error - The error to get a message from
 * @returns {string} User-friendly error message
 */
export function getUserMessage(error) {
  if (error && typeof error.getUserMessage === 'function') {
    return error.getUserMessage();
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log an error with appropriate detail level
 * @param {Error} error - The error to log
 * @param {Object} [context={}] - Additional context for logging
 */
export function logError(error, context = {}) {
  if (__DEV__) {
    console.error('[Error]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      metadata: error.metadata,
      context,
    });
  } else {
    // In production, log less detail
    console.error('[Error]', error.name, error.message);
  }
}
