# Error Logger Service (Mobile)

## Overview

The Error Logger Service provides comprehensive error logging for the Roads Authority Mobile App. It captures and logs errors related to image loading, network issues, and cache operations.

## Features

- **Categorized Logging**: Errors are categorized (IMAGE_LOAD, NETWORK, CACHE, UNKNOWN)
- **Severity Levels**: Errors are assigned severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- **Detailed Context**: Captures error details, timestamps, and platform information
- **In-Memory Storage**: Maintains last 100 logs in memory
- **Console Output**: Logs to console with appropriate formatting based on severity
- **Remote Logging**: Placeholder for integration with remote logging services (Sentry, Bugsnag, Firebase Crashlytics)
- **Statistics**: Provides error statistics by category and severity
- **Export**: Can export logs as JSON for debugging

## Usage

### Import

```javascript
import { errorLogger, ErrorCategory, ErrorSeverity } from './services/errorLogger';
```

### Log Image Load Failures

```javascript
const handleError = (error) => {
  errorLogger.logImageLoadFailure(
    imageUri,
    error?.error || 'Failed to load image',
    {
      component: 'CachedImage',
      screen: 'NewsDetail',
      resizeMode: 'cover',
    }
  );
};
```

### Log Network Errors

```javascript
try {
  const response = await fetch(url);
} catch (error) {
  errorLogger.logNetworkError(error, 'fetch news', {
    url,
    method: 'GET',
  });
}
```

### Log Cache Errors

```javascript
try {
  await cacheImage(uri);
} catch (error) {
  errorLogger.logCacheError(error, 'image caching', {
    uri,
    cacheSize: 1024,
  });
}
```

## Retrieving Logs

### Get All Logs

```javascript
const logs = errorLogger.getLogs();
```

### Filter by Category

```javascript
const imageErrors = errorLogger.getLogsByCategory(ErrorCategory.IMAGE_LOAD);
const networkErrors = errorLogger.getLogsByCategory(ErrorCategory.NETWORK);
```

### Filter by Severity

```javascript
const criticalErrors = errorLogger.getLogsBySeverity(ErrorSeverity.CRITICAL);
const highErrors = errorLogger.getLogsBySeverity(ErrorSeverity.HIGH);
```

### Get Statistics

```javascript
const stats = errorLogger.getStatistics();
console.log(`Total errors: ${stats.total}`);
console.log(`Image load errors: ${stats.byCategory[ErrorCategory.IMAGE_LOAD]}`);
console.log(`Critical errors: ${stats.bySeverity[ErrorSeverity.CRITICAL]}`);
```

### Export Logs

```javascript
const jsonLogs = errorLogger.exportLogs();
// Send to support or save locally
```

### Clear Logs

```javascript
errorLogger.clearLogs();
```

## Error Categories

- **IMAGE_LOAD**: Image loading/display failures
- **NETWORK**: Network-related errors
- **CACHE**: Image caching failures
- **UNKNOWN**: Uncategorized errors

## Severity Levels

- **LOW**: Minor issues that don't affect functionality
- **MEDIUM**: Issues that affect user experience but have workarounds
- **HIGH**: Significant issues that prevent operations
- **CRITICAL**: Critical failures requiring immediate attention

## Log Entry Structure

```javascript
{
  timestamp: string,           // ISO 8601 timestamp
  category: ErrorCategory,     // Error category
  severity: ErrorSeverity,     // Severity level
  message: string,             // Error message
  details: Object,             // Additional context
  stackTrace: string,          // Stack trace if available
  platform: 'mobile',          // Platform identifier
}
```

## Integration with Remote Logging Services

To integrate with remote logging services, modify the `sendToRemoteLogger` method in `errorLogger.js`:

### Sentry Integration

```javascript
import * as Sentry from '@sentry/react-native';

sendToRemoteLogger(entry) {
  Sentry.captureException(new Error(entry.message), {
    level: entry.severity.toLowerCase(),
    tags: {
      category: entry.category,
      platform: 'mobile',
    },
    extra: entry.details,
  });
}
```

### Firebase Crashlytics Integration

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

sendToRemoteLogger(entry) {
  crashlytics().log(entry.message);
  crashlytics().recordError(new Error(entry.message));
  crashlytics().setAttributes({
    category: entry.category,
    severity: entry.severity,
  });
}
```

### Bugsnag Integration

```javascript
import Bugsnag from '@bugsnag/react-native';

sendToRemoteLogger(entry) {
  Bugsnag.notify(new Error(entry.message), (event) => {
    event.severity = entry.severity.toLowerCase();
    event.addMetadata('error', entry.details);
  });
}
```

### Custom Backend Endpoint

```javascript
sendToRemoteLogger(entry) {
  fetch('https://your-api.com/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    // Silently fail - don't want logging to break the app
  });
}
```

## Best Practices

1. **Always log errors with context**: Include relevant details like URIs, screen names, component names
2. **Use appropriate severity levels**: Don't mark everything as CRITICAL
3. **Don't log sensitive data**: Avoid logging user data or authentication tokens
4. **Monitor log statistics**: Regularly check error statistics to identify patterns
5. **Clear logs periodically**: In production, consider clearing old logs to manage memory
6. **Test error logging**: Ensure error logging doesn't break when errors occur
7. **Handle offline scenarios**: Ensure logging works even when network is unavailable

## Testing

The error logger service includes comprehensive unit tests. Run tests with:

```bash
npm test -- errorLogger.test.js
```

## Example: CachedImage Component Integration

```javascript
import { errorLogger } from '../services/errorLogger';

export function CachedImage({ uri, ...props }) {
  const handleError = (error) => {
    errorLogger.logImageLoadFailure(
      uri,
      error?.error || 'Failed to load image',
      {
        component: 'CachedImage',
        resizeMode: props.resizeMode,
        hasPlaceholder: !!props.placeholder,
      }
    );
    
    if (props.onError) {
      props.onError(error);
    }
  };

  return (
    <Image
      source={{ uri }}
      onError={handleError}
      {...props}
    />
  );
}
```

## Requirements Validation

This service implements **Requirement 6.2**: "WHEN upload errors occur THEN the system SHALL log error details for debugging"

The service logs:
- Image load failures with URIs and context
- Network errors with operation details
- Cache errors with relevant information
- All errors with timestamps and platform information
