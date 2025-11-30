# Error Logger Service

## Overview

The Error Logger Service provides comprehensive error logging for the Roads Authority Admin Dashboard. It captures and logs errors related to image uploads, validation failures, network issues, and image display failures.

## Features

- **Categorized Logging**: Errors are categorized (UPLOAD, VALIDATION, NETWORK, IMAGE_LOAD, AUTHENTICATION)
- **Severity Levels**: Errors are assigned severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- **Detailed Context**: Captures file details, timestamps, user agent, and URL
- **In-Memory Storage**: Maintains last 100 logs in memory
- **Console Output**: Logs to console with appropriate formatting based on severity
- **Remote Logging**: Placeholder for integration with remote logging services (Sentry, LogRocket, etc.)
- **Statistics**: Provides error statistics by category and severity
- **Export**: Can export logs as JSON for debugging

## Usage

### Import

```typescript
import { errorLogger, ErrorCategory, ErrorSeverity } from './services/errorLogger.service';
```

### Log Upload Failures

```typescript
try {
  await uploadImage(file);
} catch (error) {
  errorLogger.logUploadFailure(error, file, {
    component: 'ImageUploadField',
    additionalContext: 'value',
  });
}
```

### Log Validation Failures

```typescript
const validation = validateFile(file);
if (!validation.valid) {
  errorLogger.logValidationFailure(validation.error, file);
}
```

### Log Image Load Failures

```typescript
img.onerror = () => {
  errorLogger.logImageLoadFailure(
    imageUrl,
    'Failed to load image',
    {
      component: 'ImageThumbnail',
      size: 'medium',
    }
  );
};
```

### Log Network Errors

```typescript
try {
  await fetch(url);
} catch (error) {
  errorLogger.logNetworkError(error, 'image upload', {
    url,
    timeout: 30000,
  });
}
```

### Log Authentication Errors

```typescript
if (response.status === 401) {
  errorLogger.logAuthenticationError(
    new Error('Authentication failed'),
    'image upload'
  );
}
```

## Retrieving Logs

### Get All Logs

```typescript
const logs = errorLogger.getLogs();
```

### Filter by Category

```typescript
const uploadErrors = errorLogger.getLogsByCategory(ErrorCategory.UPLOAD);
const imageLoadErrors = errorLogger.getLogsByCategory(ErrorCategory.IMAGE_LOAD);
```

### Filter by Severity

```typescript
const criticalErrors = errorLogger.getLogsBySeverity(ErrorSeverity.CRITICAL);
const highErrors = errorLogger.getLogsBySeverity(ErrorSeverity.HIGH);
```

### Get Statistics

```typescript
const stats = errorLogger.getStatistics();
console.log(`Total errors: ${stats.total}`);
console.log(`Upload errors: ${stats.byCategory[ErrorCategory.UPLOAD]}`);
console.log(`Critical errors: ${stats.bySeverity[ErrorSeverity.CRITICAL]}`);
```

### Export Logs

```typescript
const jsonLogs = errorLogger.exportLogs();
// Save to file or send to support
```

### Clear Logs

```typescript
errorLogger.clearLogs();
```

## Error Categories

- **UPLOAD**: Image upload failures
- **VALIDATION**: File validation failures (type, size)
- **NETWORK**: Network-related errors
- **IMAGE_LOAD**: Image display/loading failures
- **AUTHENTICATION**: Authentication failures
- **UNKNOWN**: Uncategorized errors

## Severity Levels

- **LOW**: Minor issues that don't affect functionality
- **MEDIUM**: Issues that affect user experience but have workarounds
- **HIGH**: Significant issues that prevent operations
- **CRITICAL**: Critical failures requiring immediate attention

## Log Entry Structure

```typescript
interface ErrorLogEntry {
  timestamp: string;           // ISO 8601 timestamp
  category: ErrorCategory;     // Error category
  severity: ErrorSeverity;     // Severity level
  message: string;             // Error message
  details?: Record<string, any>; // Additional context
  stackTrace?: string;         // Stack trace if available
  userAgent?: string;          // Browser user agent
  url?: string;                // Current page URL
}
```

## Integration with Remote Logging Services

To integrate with remote logging services like Sentry, LogRocket, or Datadog, modify the `sendToRemoteLogger` method in `errorLogger.service.ts`:

```typescript
private sendToRemoteLogger(entry: ErrorLogEntry): void {
  // Example: Sentry integration
  Sentry.captureException(new Error(entry.message), {
    level: entry.severity.toLowerCase(),
    tags: {
      category: entry.category,
    },
    extra: entry.details,
  });

  // Example: Custom backend endpoint
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    // Silently fail - don't want logging to break the app
  });
}
```

## Best Practices

1. **Always log errors with context**: Include relevant details like file names, sizes, URLs
2. **Use appropriate severity levels**: Don't mark everything as CRITICAL
3. **Don't log sensitive data**: Avoid logging passwords, tokens, or personal information
4. **Monitor log statistics**: Regularly check error statistics to identify patterns
5. **Clear logs periodically**: In production, consider clearing old logs to manage memory
6. **Test error logging**: Ensure error logging doesn't break when errors occur

## Testing

The error logger service includes comprehensive unit tests. Run tests with:

```bash
npm test -- errorLogger.service.test.ts
```

## Requirements Validation

This service implements **Requirement 6.2**: "WHEN upload errors occur THEN the system SHALL log error details for debugging"

The service logs:
- Upload failures with file details
- Validation failures with specific reasons
- Image load failures with URLs and context
- Network errors with operation details
- Authentication errors with critical severity
