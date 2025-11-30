# Design Document

## Overview

This design implements proper file download functionality for the mobile app, replacing the current browser-based approach with native file downloads using Expo FileSystem. The solution will download PDF documents to the device's local storage, show download progress, and provide options to open or share the downloaded files.

## Architecture

The download functionality will be implemented as a reusable service that can be used across different screens (TendersScreen, VacanciesScreen, etc.). The architecture follows these layers:

1. **Service Layer**: `documentDownloadService.js` - Handles file downloads, progress tracking, and file management
2. **UI Layer**: Enhanced download buttons with progress indicators
3. **Storage Layer**: Uses Expo FileSystem to manage downloaded files in the device's document directory

## Components and Interfaces

### DocumentDownloadService

A service module that provides file download functionality:

```javascript
// services/documentDownloadService.js
export const documentDownloadService = {
  // Download a file with progress tracking
  downloadFile(url, filename, onProgress),
  
  // Generate a safe filename from tender/document title
  generateSafeFilename(title, extension),
  
  // Open a downloaded file in the default viewer
  openFile(fileUri),
  
  // Share a downloaded file using native share sheet
  shareFile(fileUri, filename),
  
  // Check if a file already exists
  fileExists(filename),
  
  // Get the full path for a downloaded file
  getFilePath(filename),
  
  // Delete a downloaded file
  deleteFile(filename)
}
```

### Enhanced Download Button Component

The TendersScreen (and similar screens) will be updated to use the new download service:

- Progress indicator during download
- Success/error states
- Open and Share actions after successful download

## Data Models

### Download State

```javascript
{
  isDownloading: boolean,
  progress: number,        // 0-100
  downloadedUri: string,   // Local file URI after download
  error: string | null,
  filename: string
}
```

### Download Progress Callback

```javascript
{
  totalBytesWritten: number,
  totalBytesExpectedToWrite: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Download completion consistency

*For any* valid PDF URL and filename, when a download completes successfully, the file SHALL exist in the file system at the expected location.

**Validates: Requirements 1.1**

### Property 2: Progress indicator visibility

*For any* download in progress, the Mobile App SHALL display a progress indicator showing the download percentage.

**Validates: Requirements 1.2**

### Property 3: Success notification

*For any* successfully completed download, the Mobile App SHALL notify the user with a success message.

**Validates: Requirements 1.3**

### Property 4: Post-download actions availability

*For any* successfully completed download, the Mobile App SHALL provide options to open or share the downloaded file.

**Validates: Requirements 1.4**

### Property 5: Error message display

*For any* failed download, the Mobile App SHALL display an error message with the failure reason.

**Validates: Requirements 1.5**

### Property 6: Download button state

*For any* document with a download in progress, the download button SHALL be disabled to prevent duplicate downloads.

**Validates: Requirements 2.2**

### Property 7: Progress monotonicity

*For any* download in progress, the progress percentage SHALL never decrease (it must be monotonically non-decreasing from 0 to 100).

**Validates: Requirements 2.3**

### Property 8: Filename safety and structure

*For any* input string used to generate a filename, the resulting filename SHALL contain only safe characters (alphanumeric, hyphens, underscores, and periods), SHALL include the tender title or reference number, and SHALL preserve the PDF extension.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 9: Error recovery and retry

*For any* download that fails, the system SHALL reset the download state to allow retry.

**Validates: Requirements 5.4**

## Error Handling

### Network Errors

- Detect network failures during download
- Display user-friendly error messages
- Clean up partial downloads
- Allow retry

### File System Errors

- Handle insufficient storage space
- Handle permission denials
- Provide clear error messages with actionable guidance

### Invalid URL Errors

- Validate PDF URLs before attempting download
- Handle 404 and other HTTP errors
- Display appropriate error messages

### Error Messages

```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection lost. Please check your internet and try again.',
  INVALID_URL: 'The document URL is invalid or inaccessible.',
  STORAGE_FULL: 'Insufficient storage space. Please free up space and try again.',
  PERMISSION_DENIED: 'File access permission denied. Please check app permissions.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
  FILE_NOT_FOUND: 'The document could not be found.'
}
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific functionality:

1. **Filename Generation**
   - Test safe filename generation with special characters
   - Test filename length limits
   - Test extension preservation

2. **Error Handling**
   - Test network error detection
   - Test invalid URL handling
   - Test storage error handling

3. **File Operations**
   - Test file existence checking
   - Test file path generation
   - Test file deletion

### Property-Based Tests

Property-based tests will verify universal properties using `fast-check` library:

1. **Property 1: Download completion consistency**
   - Generate random valid URLs and filenames
   - Mock successful downloads
   - Verify file exists at expected location after download

2. **Property 2: Progress monotonicity**
   - Generate random progress sequences
   - Verify progress values never decrease
   - Verify progress starts at 0 and ends at 100

3. **Property 3: Filename safety**
   - Generate random strings with special characters
   - Verify generated filenames contain only safe characters
   - Verify file extension is preserved

4. **Property 4: Download state exclusivity**
   - Simulate concurrent download attempts
   - Verify only one download can be active at a time
   - Verify button is disabled during download

5. **Property 5: Error recovery**
   - Generate random error scenarios
   - Verify partial files are cleaned up
   - Verify state is reset for retry

**Testing Configuration:**
- Property-based tests will use `fast-check` library for JavaScript
- Each property test will run a minimum of 100 iterations
- Each test will be tagged with: `**Feature: mobile-document-download, Property {number}: {property_text}**`

### Integration Tests

1. **End-to-End Download Flow**
   - Test complete download flow from button tap to file saved
   - Test open file functionality
   - Test share file functionality

2. **Error Recovery Flow**
   - Test retry after network error
   - Test retry after invalid URL error

## Implementation Details

### Expo FileSystem API

The implementation will use the following Expo FileSystem APIs:

- `FileSystem.documentDirectory` - Base directory for downloaded files
- `FileSystem.createDownloadResumable()` - Create resumable download with progress tracking
- `FileSystem.downloadAsync()` - Simple download without resume capability
- `FileSystem.getInfoAsync()` - Check if file exists
- `FileSystem.deleteAsync()` - Delete files

### Expo Sharing API

For sharing downloaded files:

- `Sharing.shareAsync()` - Open native share sheet with file

### Platform Considerations

**iOS:**
- Files saved to `FileSystem.documentDirectory` are accessible to the user
- Share sheet works natively with `Sharing.shareAsync()`
- Files can be opened with `Linking.openURL()` for the file URI

**Android:**
- Files saved to `FileSystem.documentDirectory` are app-private
- For user-accessible downloads, may need to use `FileSystem.StorageAccessFramework` (optional enhancement)
- Share sheet works natively with `Sharing.shareAsync()`
- Files can be opened with `Linking.openURL()` for the file URI

## File Naming Strategy

Files will be named using the following pattern:

```
{sanitized-tender-title}_{reference-number}.pdf
```

Example: `Road_Construction_Project_TND-2024-001.pdf`

Sanitization rules:
- Replace spaces with underscores
- Remove special characters except hyphens and underscores
- Limit filename length to 100 characters
- Preserve `.pdf` extension

## User Experience Flow

1. User taps "Download Document" button
2. Button shows "Downloading..." with progress percentage
3. Progress bar updates in real-time
4. On success:
   - Show success alert with "Open" and "Share" options
   - Reset button to "Download Document" (allow re-download)
5. On error:
   - Show error alert with specific error message
   - Reset button to "Download Document" (allow retry)

## Dependencies

- `expo-file-system` (already installed)
- `expo-sharing` (needs to be added)
- `fast-check` (for property-based testing, needs to be added)

## Security Considerations

- Validate PDF URLs before download to prevent malicious URLs
- Sanitize filenames to prevent directory traversal attacks
- Handle file permissions appropriately
- Clean up failed downloads to prevent storage bloat
