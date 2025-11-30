import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorLogger, ErrorCategory, ErrorSeverity } from '../errorLogger.service';

describe('ErrorLoggerService', () => {
  beforeEach(() => {
    // Clear logs before each test
    errorLogger.clearLogs();
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('logUploadFailure', () => {
    it('should log upload failure with file details', () => {
      const error = new Error('Upload failed');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      errorLogger.logUploadFailure(error, file, { additionalInfo: 'test' });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.UPLOAD);
      expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
      expect(logs[0].message).toContain('Upload failed');
      expect(logs[0].details?.fileName).toBe('test.jpg');
      expect(logs[0].details?.fileType).toBe('image/jpeg');
    });

    it('should log upload failure without file', () => {
      const error = new Error('Upload failed');

      errorLogger.logUploadFailure(error);

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.UPLOAD);
    });
  });

  describe('logValidationFailure', () => {
    it('should log validation failure with file details', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      errorLogger.logValidationFailure('File too large', file);

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.VALIDATION);
      expect(logs[0].severity).toBe(ErrorSeverity.MEDIUM);
      expect(logs[0].message).toContain('File too large');
    });
  });

  describe('logImageLoadFailure', () => {
    it('should log image load failure with URL', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const error = new Error('Failed to load');

      errorLogger.logImageLoadFailure(imageUrl, error, { component: 'ImageThumbnail' });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.IMAGE_LOAD);
      expect(logs[0].severity).toBe(ErrorSeverity.MEDIUM);
      expect(logs[0].details?.imageUrl).toBe(imageUrl);
      expect(logs[0].details?.component).toBe('ImageThumbnail');
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

      errorLogger.logNetworkError(error, 'image upload', { timeout: 30000 });

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.NETWORK);
      expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
      expect(logs[0].message).toContain('image upload');
    });
  });

  describe('logAuthenticationError', () => {
    it('should log authentication error with critical severity', () => {
      const error = new Error('Auth failed');

      errorLogger.logAuthenticationError(error, 'image upload');

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].category).toBe(ErrorCategory.AUTHENTICATION);
      expect(logs[0].severity).toBe(ErrorSeverity.CRITICAL);
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
      errorLogger.logUploadFailure(new Error('Upload error'));
      errorLogger.logImageLoadFailure('image.jpg', 'Load error');
      errorLogger.logValidationFailure('Validation error');

      const uploadLogs = errorLogger.getLogsByCategory(ErrorCategory.UPLOAD);
      expect(uploadLogs).toHaveLength(1);

      const imageLogs = errorLogger.getLogsByCategory(ErrorCategory.IMAGE_LOAD);
      expect(imageLogs).toHaveLength(1);
    });

    it('should filter logs by severity', () => {
      errorLogger.logUploadFailure(new Error('Upload error')); // HIGH
      errorLogger.logImageLoadFailure('image.jpg', 'Load error'); // MEDIUM
      errorLogger.logValidationFailure('Validation error'); // MEDIUM

      const highLogs = errorLogger.getLogsBySeverity(ErrorSeverity.HIGH);
      expect(highLogs).toHaveLength(1);

      const mediumLogs = errorLogger.getLogsBySeverity(ErrorSeverity.MEDIUM);
      expect(mediumLogs).toHaveLength(2);
    });

    it('should export logs as JSON', () => {
      errorLogger.logUploadFailure(new Error('Test error'));

      const exported = errorLogger.exportLogs();
      expect(exported).toBeTruthy();
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should provide statistics', () => {
      errorLogger.logUploadFailure(new Error('Upload error'));
      errorLogger.logImageLoadFailure('image.jpg', 'Load error');
      errorLogger.logValidationFailure('Validation error');

      const stats = errorLogger.getStatistics();
      expect(stats.total).toBe(3);
      expect(stats.byCategory[ErrorCategory.UPLOAD]).toBe(1);
      expect(stats.byCategory[ErrorCategory.IMAGE_LOAD]).toBe(1);
      expect(stats.byCategory[ErrorCategory.VALIDATION]).toBe(1);
    });

    it('should clear all logs', () => {
      errorLogger.logUploadFailure(new Error('Test error'));
      expect(errorLogger.getLogs()).toHaveLength(1);

      errorLogger.clearLogs();
      expect(errorLogger.getLogs()).toHaveLength(0);
    });
  });

  describe('log entry structure', () => {
    it('should include timestamp in log entries', () => {
      errorLogger.logUploadFailure(new Error('Test error'));

      const logs = errorLogger.getLogs();
      expect(logs[0].timestamp).toBeTruthy();
      expect(new Date(logs[0].timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should include userAgent in log entries', () => {
      errorLogger.logUploadFailure(new Error('Test error'));

      const logs = errorLogger.getLogs();
      expect(logs[0].userAgent).toBeTruthy();
    });

    it('should include url in log entries', () => {
      errorLogger.logUploadFailure(new Error('Test error'));

      const logs = errorLogger.getLogs();
      expect(logs[0].url).toBeTruthy();
    });
  });
});
