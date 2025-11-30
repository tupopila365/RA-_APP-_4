import { errorLogger, ErrorCategory, ErrorSeverity } from '../errorLogger';

describe('ErrorLoggerService (Mobile)', () => {
  beforeEach(() => {
    // Clear logs before each test
    errorLogger.clearLogs();
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logImageLoadFailure', () => {
    it('should log image load failure with URL', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const error = new Error('Failed to load');

      errorLogger.logImageLoadFailure(imageUrl, error, { component: 'CachedImage' });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.IMAGE_LOAD);
      expect(logs[0].severity).toBe(ErrorSeverity.MEDIUM);
      expect(logs[0].details.imageUrl).toBe(imageUrl);
      expect(logs[0].details.component).toBe('CachedImage');
    });

    it('should handle string error messages', () => {
      const imageUrl = 'https://example.com/image.jpg';

      errorLogger.logImageLoadFailure(imageUrl, 'Network error');

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('Network error');
    });
  });

  describe('logNetworkError', () => {
    it('should log network error with operation details', () => {
      const error = new Error('Network timeout');

      errorLogger.logNetworkError(error, 'image fetch', { timeout: 30000 });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.NETWORK);
      expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
      expect(logs[0].message).toContain('image fetch');
    });
  });

  describe('logCacheError', () => {
    it('should log cache error with low severity', () => {
      const error = new Error('Cache write failed');

      errorLogger.logCacheError(error, 'image caching', { cacheSize: 1024 });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.CACHE);
      expect(logs[0].severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('log management', () => {
    it('should maintain maximum log size', () => {
      // Log more than maxLogs (100)
      for (let i = 0; i < 150; i++) {
        errorLogger.logImageLoadFailure(`image-${i}.jpg`, 'Failed');
      }

      const logs = errorLogger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });

    it('should filter logs by category', () => {
      errorLogger.logNetworkError(new Error('Network error'), 'fetch');
      errorLogger.logImageLoadFailure('image.jpg', 'Load error');
      errorLogger.logCacheError(new Error('Cache error'), 'write');

      const networkLogs = errorLogger.getLogsByCategory(ErrorCategory.NETWORK);
      expect(networkLogs).toHaveLength(1);

      const imageLogs = errorLogger.getLogsByCategory(ErrorCategory.IMAGE_LOAD);
      expect(imageLogs).toHaveLength(1);
    });

    it('should filter logs by severity', () => {
      errorLogger.logNetworkError(new Error('Network error'), 'fetch'); // HIGH
      errorLogger.logImageLoadFailure('image.jpg', 'Load error'); // MEDIUM
      errorLogger.logCacheError(new Error('Cache error'), 'write'); // LOW

      const highLogs = errorLogger.getLogsBySeverity(ErrorSeverity.HIGH);
      expect(highLogs).toHaveLength(1);

      const mediumLogs = errorLogger.getLogsBySeverity(ErrorSeverity.MEDIUM);
      expect(mediumLogs).toHaveLength(1);

      const lowLogs = errorLogger.getLogsBySeverity(ErrorSeverity.LOW);
      expect(lowLogs).toHaveLength(1);
    });

    it('should export logs as JSON', () => {
      errorLogger.logImageLoadFailure('image.jpg', 'Test error');

      const exported = errorLogger.exportLogs();
      expect(exported).toBeTruthy();
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should provide statistics', () => {
      errorLogger.logNetworkError(new Error('Network error'), 'fetch');
      errorLogger.logImageLoadFailure('image.jpg', 'Load error');
      errorLogger.logCacheError(new Error('Cache error'), 'write');

      const stats = errorLogger.getStatistics();
      expect(stats.total).toBe(3);
      expect(stats.byCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(stats.byCategory[ErrorCategory.IMAGE_LOAD]).toBe(1);
      expect(stats.byCategory[ErrorCategory.CACHE]).toBe(1);
    });

    it('should clear all logs', () => {
      errorLogger.logImageLoadFailure('image.jpg', 'Test error');
      expect(errorLogger.getLogs()).toHaveLength(1);

      errorLogger.clearLogs();
      expect(errorLogger.getLogs()).toHaveLength(0);
    });
  });

  describe('log entry structure', () => {
    it('should include timestamp in log entries', () => {
      errorLogger.logImageLoadFailure('image.jpg', 'Test error');

      const logs = errorLogger.getLogs();
      expect(logs[0].timestamp).toBeTruthy();
      expect(new Date(logs[0].timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should include platform in log entries', () => {
      errorLogger.logImageLoadFailure('image.jpg', 'Test error');

      const logs = errorLogger.getLogs();
      expect(logs[0].platform).toBe('mobile');
    });
  });
});
