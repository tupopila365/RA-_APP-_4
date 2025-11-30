/**
 * Error Logger Service for Mobile App
 * Provides comprehensive error logging for image load failures
 * Implements Requirement 6.2: Log error details for debugging
 */

export const ErrorCategory = {
  IMAGE_LOAD: 'IMAGE_LOAD',
  NETWORK: 'NETWORK',
  CACHE: 'CACHE',
  UNKNOWN: 'UNKNOWN',
};

export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Error Logger Service
 * Centralized error logging for mobile app operations
 */
class ErrorLoggerService {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs in memory
    this.isDevelopment = __DEV__;
  }

  /**
   * Log an image load failure
   * @param {string} imageUrl - URL of image that failed to load
   * @param {Error|string} error - Error details if available
   * @param {Object} context - Additional context (e.g., component name, screen)
   */
  logImageLoadFailure(imageUrl, error, context = {}) {
    const details = {
      imageUrl,
      ...context,
    };

    const errorMessage = error instanceof Error ? error.message : error;

    this.logError({
      category: ErrorCategory.IMAGE_LOAD,
      severity: ErrorSeverity.MEDIUM,
      message: `Image failed to load: ${errorMessage || 'Unknown error'}`,
      details,
      stackTrace: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * Log a network error
   * @param {Error} error - Network error
   * @param {string} operation - Operation that failed
   * @param {Object} additionalDetails - Additional context
   */
  logNetworkError(error, operation, additionalDetails = {}) {
    this.logError({
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: `Network error during ${operation}: ${error.message}`,
      details: additionalDetails,
      stackTrace: error.stack,
    });
  }

  /**
   * Log a cache error
   * @param {Error} error - Cache error
   * @param {string} operation - Operation that failed
   * @param {Object} additionalDetails - Additional context
   */
  logCacheError(error, operation, additionalDetails = {}) {
    this.logError({
      category: ErrorCategory.CACHE,
      severity: ErrorSeverity.LOW,
      message: `Cache error during ${operation}: ${error.message}`,
      details: additionalDetails,
      stackTrace: error.stack,
    });
  }

  /**
   * Generic error logging method
   * @param {Object} entry - Error log entry (timestamp added automatically)
   */
  logError(entry) {
    const logEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      platform: 'mobile',
    };

    // Add to in-memory logs
    this.logs.push(logEntry);

    // Maintain max log size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging based on environment and severity
    this.consoleLog(logEntry);

    // In production, you might want to send logs to a remote service
    if (!this.isDevelopment) {
      this.sendToRemoteLogger(logEntry);
    }
  }

  /**
   * Log to console with appropriate formatting
   * @param {Object} entry - Error log entry
   */
  consoleLog(entry) {
    const prefix = `[${entry.category}] [${entry.severity}]`;
    const message = `${prefix} ${entry.message}`;

    // Use appropriate console method based on severity
    switch (entry.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(message, {
          timestamp: entry.timestamp,
          details: entry.details,
          stackTrace: entry.stackTrace,
        });
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(message, {
          timestamp: entry.timestamp,
          details: entry.details,
        });
        break;
      case ErrorSeverity.LOW:
        if (this.isDevelopment) {
          console.log(message, {
            timestamp: entry.timestamp,
            details: entry.details,
          });
        }
        break;
      default:
        console.log(message, entry);
    }
  }

  /**
   * Send error logs to remote logging service
   * @param {Object} entry - Error log entry
   */
  sendToRemoteLogger(entry) {
    // Placeholder for remote logging integration
    // In production, you would send logs to services like:
    // - Sentry
    // - Bugsnag
    // - Firebase Crashlytics
    // - Custom backend endpoint
    
    // Example implementation:
    // fetch('https://your-api.com/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // }).catch(() => {
    //   // Silently fail - don't want logging to break the app
    // });
  }

  /**
   * Get all logged errors
   * @returns {Array} Array of error log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs filtered by category
   * @param {string} category - Error category to filter by
   * @returns {Array} Filtered array of error log entries
   */
  getLogsByCategory(category) {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get logs filtered by severity
   * @param {string} severity - Error severity to filter by
   * @returns {Array} Filtered array of error log entries
   */
  getLogsBySeverity(severity) {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   * @returns {string} JSON string of all logs
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get error statistics
   * @returns {Object} Statistics about logged errors
   */
  getStatistics() {
    const stats = {
      total: this.logs.length,
      byCategory: {},
      bySeverity: {},
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach((category) => {
      stats.byCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach((severity) => {
      stats.bySeverity[severity] = 0;
    });

    // Count occurrences
    this.logs.forEach((log) => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggerService();

export default errorLogger;
