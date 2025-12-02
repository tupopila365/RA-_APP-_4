# Design Document

## Overview

This design modifies the PDF upload and download flow to make Google Drive the exclusive storage backend for RAG service PDF downloads. The upload service will require Google Drive to be configured and will fail PDF uploads if Google Drive is unavailable. The RAG service will primarily use Google Drive URLs but maintain backward compatibility with existing Cloudinary URLs during the migration period.

## Architecture

### Current Architecture
- Upload Service uploads PDFs to both Cloudinary and Google Drive (if configured)
- ragDownloadUrl field stores Google Drive URL if available, otherwise Cloudinary URL
- RAG Service downloads from whichever URL is provided

### New Architecture
- Upload Service requires Google Drive configuration for PDF uploads
- Upload Service uploads PDFs to Google Drive only (Cloudinary optional for display purposes)
- ragDownloadUrl field always contains Google Drive direct download link
- RAG Service prefers Google Drive URLs but falls back to Cloudinary for legacy documents

## Components and Interfaces

### Upload Service (backend/src/modules/upload/upload.service.ts)

**Modified Methods:**

```typescript
async uploadPDF(file: Express.Multer.File, userInfo?: { userId: string; email: string }): Promise<PDFUploadResult>
```

Changes:
- Check Google Drive configuration at the start (fail fast if not configured)
- Upload to Google Drive first (required)
- Upload to Cloudinary second (optional, for display purposes only)
- Always set ragDownloadUrl to Google Drive direct download link
- Throw error if Google Drive upload fails

**New Validation Method:**

```typescript
private validateGoogleDriveConfiguration(): void
```

- Checks if Google Drive credentials are configured
- Throws UploadError with type CONFIGURATION_ERROR if not configured
- Logs specific missing configuration fields

### PDF Processor (rag-service/app/services/pdf_processor.py)

**Modified Methods:**

```python
def download_pdf(self, url: str, document_id: Optional[str] = None) -> bytes
```

Changes:
- Detect URL source (Google Drive vs Cloudinary) before download
- Log the storage backend being used
- Add migration warning for Cloudinary URLs
- Maintain existing retry logic and error handling

**New Helper Method:**

```python
def _detect_url_source(self, url: str) -> str
```

- Returns 'google_drive' for Google Drive URLs
- Returns 'cloudinary' for Cloudinary URLs
- Returns 'unknown' for other URLs

### Google Drive Service (backend/src/config/google-drive.ts)

No changes required - existing implementation already provides:
- `isGoogleDriveConfigured()` - Check if credentials are present
- `uploadToGoogleDrive()` - Upload file and return direct download link
- `deleteFromGoogleDrive()` - Delete file by ID

## Data Models

### PDFUploadResult Interface

```typescript
interface PDFUploadResult {
  url: string;                    // Cloudinary URL for display (optional)
  publicId: string;               // Cloudinary public ID (optional)
  format: string;
  bytes: number;
  googleDriveFileId: string;      // Required - Google Drive file ID
  googleDriveUrl: string;         // Required - Google Drive web view link
  ragDownloadUrl: string;         // Required - Google Drive direct download link
  accessType?: 'public' | 'signed';
  expiresAt?: Date;
}
```

Changes:
- `googleDriveFileId` becomes required (not optional)
- `googleDriveUrl` becomes required (not optional)
- `ragDownloadUrl` always contains Google Drive URL
- `url` and `publicId` become optional (Cloudinary fields)

## Corr
ectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: ragDownloadUrl contains Google Drive URL
*For any* uploaded PDF, the ragDownloadUrl field should match the Google Drive direct download link pattern (https://drive.google.com/uc?export=download&id=*)
**Validates: Requirements 1.1, 1.4**

Property 2: Upload fails when Google Drive fails
*For any* PDF upload where Google Drive upload fails, the system should reject the upload and return an error (not proceed with Cloudinary-only upload)
**Validates: Requirements 1.2**

Property 3: RAG service uses Google Drive URLs
*For any* document with a Google Drive ragDownloadUrl, the RAG service should download the PDF from that Google Drive URL
**Validates: Requirements 1.3**

Property 4: Configuration error logs contain missing fields
*For any* configuration validation failure, the logged error should contain the names of the specific missing configuration fields
**Validates: Requirements 2.1**

Property 5: Upload failure logs contain metadata
*For any* Google Drive upload failure, the log entry should contain file metadata (name, size, mimetype) and Google Drive response details
**Validates: Requirements 2.2**

Property 6: Download failure logs contain URL and error
*For any* RAG service download failure, the log entry should contain the URL and error details (error type, HTTP status code if applicable)
**Validates: Requirements 2.4**

Property 7: Cloudinary URLs work as fallback
*For any* document with a Cloudinary ragDownloadUrl, the RAG service should successfully download the PDF from Cloudinary
**Validates: Requirements 3.1**

Property 8: Cloudinary URLs trigger migration warning
*For any* document processed with a Cloudinary ragDownloadUrl, the logs should contain a migration warning message
**Validates: Requirements 3.2**

Property 9: Google Drive preferred over Cloudinary
*For any* document with both Google Drive and Cloudinary URLs available, the RAG service should use the Google Drive URL for download
**Validates: Requirements 3.3**

Property 10: Cloudinary failure mentions migration
*For any* Cloudinary URL download failure, the error message should contain text indicating migration to Google Drive is needed
**Validates: Requirements 3.4**

Property 11: Download logs contain source
*For any* PDF download, the log entry should contain the URL source (either "google_drive" or "cloudinary")
**Validates: Requirements 4.1**

Property 12: Success logs contain metrics
*For any* successful PDF download, the log entry should contain file size and download duration
**Validates: Requirements 4.2**

Property 13: Failure logs contain complete error info
*For any* failed PDF download, the log entry should contain the URL, error type, and HTTP status code (if applicable)
**Validates: Requirements 4.3**

Property 14: Processing logs contain backend info
*For any* RAG service processing operation, the initial log entry should contain which storage backend is being used
**Validates: Requirements 4.4**

## Error Handling

### Upload Service Errors

**Configuration Errors:**
- Error Type: `CONFIGURATION_ERROR`
- HTTP Status: 503 Service Unavailable
- Trigger: Google Drive credentials not configured
- Message: "Google Drive is not configured. PDF uploads require Google Drive. Please configure GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN."
- Logging: Log specific missing environment variables

**Google Drive Upload Errors:**
- Error Type: `GOOGLE_DRIVE_ERROR`
- HTTP Status: 500 Internal Server Error
- Trigger: Google Drive API returns error
- Message: "Failed to upload PDF to Google Drive: {error details}"
- Logging: Log file metadata, Google Drive error response, and user info

**Validation Errors:**
- Error Type: `VALIDATION_ERROR`
- HTTP Status: 400 Bad Request
- Trigger: Invalid PDF file (size, format, mimetype)
- Message: Specific validation failure message
- Logging: Log file metadata and validation failure reason

### RAG Service Errors

**Download Errors:**
- Error Code: `DOWNLOAD_FAILED`
- Trigger: Network errors, timeouts, or HTTP errors
- Message: "Failed to download PDF after {max_retries} attempts: {error details}"
- Logging: Log URL, source (Google Drive/Cloudinary), error type, HTTP status code, and document ID

**Authentication Errors:**
- Error Code: `AUTH_REQUIRED` (401) or `ACCESS_FORBIDDEN` (403)
- Trigger: URL requires authentication
- Message: "PDF download failed: Authentication required" or "Access forbidden"
- Logging: Log URL, status code, document ID, and skip retry indication
- Behavior: Do not retry (authentication errors require configuration changes)

**Migration Warnings:**
- Trigger: Processing document with Cloudinary URL
- Message: "Processing PDF from Cloudinary URL - migration to Google Drive recommended"
- Logging: Log document ID, Cloudinary URL, and migration recommendation

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Configuration validation logic (Google Drive credentials check)
- URL source detection (Google Drive vs Cloudinary pattern matching)
- Error message formatting
- Log entry structure validation

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using random inputs:

**Testing Framework:** 
- Backend (TypeScript): fast-check
- RAG Service (Python): Hypothesis

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: rag-google-drive-only, Property {number}: {property_text}**`

**Property Test Coverage:**
1. Upload flow properties (Properties 1-2)
2. Download flow properties (Properties 3, 7, 9)
3. Logging properties (Properties 4-6, 8, 10-14)

**Test Generators:**
- Random PDF files (varying sizes, valid format)
- Random Google Drive URLs (valid file ID patterns)
- Random Cloudinary URLs (valid public ID patterns)
- Random configuration states (missing credentials)
- Random error scenarios (network failures, HTTP errors)

### Integration Testing

Integration tests will verify:
- End-to-end upload flow (file → Google Drive → database)
- End-to-end download flow (database → URL → RAG service)
- Backward compatibility with existing Cloudinary URLs
- Error propagation from Google Drive API to client
- Migration path from Cloudinary to Google Drive

## Migration Strategy

### Phase 1: Deploy New Code
- Deploy updated upload service (requires Google Drive)
- Deploy updated RAG service (prefers Google Drive, falls back to Cloudinary)
- All new uploads go to Google Drive only

### Phase 2: Monitor
- Monitor logs for Cloudinary URL usage (migration warnings)
- Track download success rates by source
- Identify documents that need re-upload

### Phase 3: Re-upload Legacy Documents
- Create migration script to re-upload Cloudinary PDFs to Google Drive
- Update ragDownloadUrl fields in database
- Verify all documents have Google Drive URLs

### Phase 4: Remove Cloudinary Fallback (Optional)
- After all documents migrated, remove Cloudinary fallback logic
- Simplify RAG service to only support Google Drive URLs

## Configuration

### Required Environment Variables

**Backend (.env):**
```
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id (optional)
```

**RAG Service (.env):**
No new configuration required - uses URLs from database

### Optional Environment Variables

**Backend (.env):**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name (optional, for display URLs)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
```

## Performance Considerations

### Upload Performance
- Google Drive uploads may be slower than Cloudinary
- Consider async upload processing for large files
- Implement upload progress tracking

### Download Performance
- Google Drive direct download links are reliable
- No authentication overhead (public files)
- Consider caching frequently accessed PDFs

### Monitoring
- Track upload success/failure rates
- Monitor download latency by source
- Alert on Google Drive API quota limits
