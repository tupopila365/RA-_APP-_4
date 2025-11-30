/**
 * Error Logger Service
 * Provides comprehensive error logging for image uploads and display failures
 * Implements Requirement 6.2: Log error details for debugging
 */

export enum ErrorCategory {
  UPLOAD = 'UPLOAD',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  IMAGE_LOAD = 'IMAGE_LOAD',
  AUTHENTICATION = 'AUTHENTICATION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorLogEntry {
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: Record<string, any>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Error Logger Service
 * Centralized error logging for image upload and display operations
 */
class ErrorLoggerService {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an upload failure with detailed context
   * @param error - The error that occurred
   * @param file - File that failed to upload
   * @param additionalDetails - Any additional context
   */
  logUploadFailure(
    error: Error,
    file?: File,
    additionalDetails?: Record<string, any>
  ): void {
    const details: Record<string, any> = {
      ...additionalDetails,
    };

    if (file) {
      details.fileName = file.name;
      details.fileSize = file.size;
      details.fileType = file.type;
      details.lastModified = new Date(file.lastModified).toISOString();
    }

    this.logError({
      category: ErrorCategory.UPLOAD,
      severity: ErrorSeverity.HIGH,
      message: `Image upload failed: ${error.message}`,
      details,
      stackTrace: error.stack,
    });
  }

  /**
   * Log a validation failure
   * @param validationError - Description of validation failure
   * @param file - File that failed validation
   */
  logValidationFailure(validationError: string, file?: File): void {
    const details: Record<string, any> = {
      validationError,
    };

    if (file) {
      details.fileName = file.name;
      details.fileSize = file.size;
      details.fileType = file.type;
    }

    this.logError({
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: `Image validation failed: ${validationError}`,
      details,
    });
  }

  /**
   * Log an image load failure
   * @param imageUrl - URL of image that failed to load
   * @param error - Error details if available
   * @param context - Additional context (e.g., component name, page)
   */
  logImageLoadFailure(
    imageUrl: string,
    error?: Error | string,
    context?: Record<string, any>
  ): void {
    const details: Record<string, any> = {
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
   * @param error - Network error
   * @param operation - Operation that failed (e.g., 'upload', 'fetch')
   * @param additionalDetails - Additional context
   */
  logNetworkError(
    error: Error,
    operation: string,
    additionalDetails?: Record<string, any>
  ): void {
    this.logError({
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: `Network error during ${operation}: ${error.message}`,
      details: additionalDetails,
      stackTrace: error.stack,
    });
  }

  /**
   * Log an authentication error
   * @param error - Authentication error
   * @param operation - Operation that required authentication
   */
  logAuthenticationError(error: Error, operation: string): void {
    this.logError({
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.CRITICAL,
      message: `Authentication failed for ${operation}: ${error.message}`,
      details: { operation },
      stackTrace: error.stack,
    });
  }

  /**
   * Generic error logging method
   * @param entry - Partial error log entry (timestamp, userAgent, url added automatically)
   */
  private logError(entry: Omit<ErrorLogEntry, 'timestamp' | 'userAgent' | 'url'>): void {
    const logEntry: ErrorLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
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
   * @param entry - Error log entry
   */
  private consoleLog(entry: ErrorLogEntry): void {
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
    }
  }

  /**
   * Send error logs to remote logging service
   * @param entry - Error log entry
   */
  private sendToRemoteLogger(entry: ErrorLogEntry): void {
    // Placeholder for remote logging integration
    // In production, you would send logs to services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom backend endpoint
    
    // Example implementation:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // }).catch(() => {
    //   // Silently fail - don't want logging to break the app
    // });
  }

  /**
   * Get all logged errors
   * @returns Array of error log entries
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by category
   * @param category - Error category to filter by
   * @returns Filtered array of error log entries
   */
  getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get logs filtered by severity
   * @param severity - Error severity to filter by
   * @returns Filtered array of error log entries
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   * @returns JSON string of all logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get error statistics
   * @returns Statistics about logged errors
   */
  getStatistics(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.logs.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
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
      stats.byCategory[log.category]++;
      stats.bySeverity[log.severity]++;
    });

    return stats;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggerService();

export default errorLogger;
