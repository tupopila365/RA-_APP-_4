# Design Document

## Overview

This design document outlines the implementation approach for reliable PDF document upload functionality in the Roads Authority application. The solution addresses the current error handling issues in PDF uploads, provides proper error diagnostics, implements upload progress tracking, and ensures PDF documents are correctly stored and accessible for vacancies and tenders.

## Architecture

### Component Structure

```
Backend (Node.js/Express/TypeScript)
├── Upload Service
│   ├── PDF Validation
│   ├── Cloudinary Integration
│   ├── Error Handling & Logging
│   └── File Metadata Management
├── Upload Controller
│   ├── Request Handling
│   ├── Response Formatting
│   └── Error Response Management
├── Upload Middleware
│   ├── Multer Configuration
│   ├── File Filtering
│   └── Size Validation
└── Upload Routes
    ├── Authentication
    ├── File Upload Endpoint
    └── File Deletion Endpoint

Admin Dashboard (React/TypeScript)
├── PDFUploadField Component
│   ├── File Input
│   ├── Progress Bar
│   ├── Document Preview
│   └── Error Display
├── PDF Upload Service
│   ├── Upload with Progress
│   ├── Validation
│   └── Error Handling
└── PDFPreview Component
    ├── Modal Viewer
    ├── Document Display
    └── Action Buttons

Mobile App (React Native)
├── PDF Download Button
├── Document Viewer Integration
└── Error Handling
```

### Data Flow

1. User selects PDF file in admin dashboard
2. Client validates file (type, size, mimetype)
3. Upload begins with progress tracking via FormData
4. Multer middleware validates and buffers file
5. Upload controller receives file
6. Upload service validates PDF
7. Cloudinary API uploads file as 'raw' resource type
8. Service returns document URL and metadata
9. Client displays success and document info
10. Document URL saved with vacancy/tender record
11. Mobile app displays download button for PDF

## Components and Interfaces

### Backend Interfaces

#### Upload Service

```typescript
interface UploadService {
  uploadPDF(file: Express.Multer.File): Promise<PDFUploadResult>;
  validatePDF(file: Express.Multer.File): ValidationResult;
  deletePDF(publicId: string): Promise<void>;
}

interface PDFUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

#### Upload Controller

```typescript
interface UploadController {
  uploadPDF(req: Request, res: Response, next: NextFunction): Promise<void>;
  deletePDF(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

### Frontend Interfaces

#### PDFUploadField Component

```typescript
interface PDFUploadFieldProps {
  value?: string; // Current PDF URL
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  label?: string;
  required?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  documentUrl: string | null;
  documentInfo: DocumentInfo | null;
}

interface DocumentInfo {
  filename: string;
  size: number;
  url: string;
}
```

#### PDF Upload Service

```typescript
interface PDFUploadService {
  uploadPDF(
    file: File,
    onProgress: (progress: number) => void
  ): Promise<PDFUploadResult>;
  
  validatePDF(file: File): ValidationResult;
  
  deletePDF(publicId: string): Promise<void>;
}
```

## Data Models

### Cloudinary Upload Configuration

```typescript
interface CloudinaryPDFConfig {
  folder: string; // 'roads-authority/pdfs'
  resource_type: 'raw'; // Required for PDFs
  format: 'pdf';
}
```

### Error Response Model

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  details?: {
    errorType: string;
    fileName?: string;
    fileSize?: number;
    cloudinaryError?: any;
  };
}
```

### Success Response Model

```typescript
interface SuccessResponse {
  success: true;
  message: string;
  data: PDFUploadResult;
}
```

## Cor
rectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PDF validation accepts only valid PDFs
*For any* file, the validation function should return valid=true only when the file has .pdf extension, application/pdf mimetype, and size under 10MB
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 2: Successful uploads return complete metadata
*For any* valid PDF file that uploads successfully, the response must contain url, publicId, format, and bytes fields
**Validates: Requirements 1.3**

### Property 3: Upload errors include diagnostic information
*For any* upload failure, the error response must include error message, error type, and file metadata (name, size, type)
**Validates: Requirements 1.4, 5.2, 5.4**

### Property 4: Validation errors are specific
*For any* validation failure, the error message must specifically indicate which validation rule failed (type, size, or mimetype)
**Validates: Requirements 3.4**

### Property 5: Upload progress is monotonic
*For any* PDF upload, progress values should only increase or stay the same, never decrease
**Validates: Requirements 2.1**

### Property 6: Authenticated requests required
*For any* upload request without valid authentication, the system must reject with 401 Unauthorized
**Validates: Requirements 7.1, 7.2**

### Property 7: Cloudinary uses raw resource type
*For any* PDF upload to Cloudinary, the upload configuration must specify resource_type as 'raw'
**Validates: Requirements 7.3**

### Property 8: PDFs stored in dedicated folder
*For any* PDF upload, the Cloudinary public_id must include the 'roads-authority/pdfs' folder path
**Validates: Requirements 7.4**

### Property 9: Document URL persistence
*For any* vacancy or tender with an uploaded PDF, saving the record must persist the document URL to the database
**Validates: Requirements 1.5**

### Property 10: Preview available for uploaded documents
*For any* uploaded PDF document, the UI must render a preview button that opens the document
**Validates: Requirements 4.2, 4.3**

### Property 11: Unknown errors are serialized
*For any* error that is not an instance of Error, the system must serialize the complete error object and include it in logs
**Validates: Requirements 5.5**

### Property 12: Form submission includes document URL
*For any* form with an uploaded PDF, the submit payload must include the document URL field
**Validates: Requirements 4.5**

## Error Handling

### Current Error Issues

The current implementation has a critical error handling flaw at line 197 in upload.service.ts:

```typescript
throw new Error(`Failed to upload PDF: ${JSON.stringify(error)}`);
```

This approach has several problems:
1. JSON.stringify on circular objects (like Cloudinary errors) returns "[object Object]" or fails
2. Error stack traces are lost
3. Specific error types (network, auth, service) are not distinguished
4. Debugging information is insufficient

### Improved Error Handling Strategy

#### Error Types

```typescript
enum UploadErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CLOUDINARY_ERROR = 'CLOUDINARY_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface UploadError extends Error {
  type: UploadErrorType;
  details?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    cloudinaryError?: any;
    originalError?: any;
  };
}
```

#### Error Handling Implementation

```typescript
async uploadPDF(file: Express.Multer.File): Promise<PDFUploadResult> {
  try {
    // Validation
    const validation = this.validatePDF(file);
    if (!validation.valid) {
      throw this.createUploadError(
        UploadErrorType.VALIDATION_ERROR,
        validation.error!,
        { fileName: file.originalname, fileSize: file.size, fileType: file.mimetype }
      );
    }

    // Configuration check
    if (!isCloudinaryConfigured()) {
      throw this.createUploadError(
        UploadErrorType.CONFIGURATION_ERROR,
        'Cloudinary is not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      );
    }

    // Upload
    const result = await cloudinary.uploader.upload(dataURI, config);
    return this.formatResult(result);

  } catch (error) {
    return this.handleUploadError(error, file);
  }
}

private handleUploadError(error: any, file: Express.Multer.File): never {
  const fileMetadata = {
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype,
  };

  // Already an UploadError
  if (error.type) {
    logger.error('Upload error:', { ...error, ...fileMetadata });
    throw error;
  }

  // Cloudinary specific errors
  if (error.http_code) {
    logger.error('Cloudinary API error:', {
      httpCode: error.http_code,
      message: error.message,
      ...fileMetadata,
    });
    throw this.createUploadError(
      UploadErrorType.CLOUDINARY_ERROR,
      `Cloudinary error: ${error.message}`,
      { ...fileMetadata, cloudinaryError: error }
    );
  }

  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    logger.error('Network error:', { code: error.code, message: error.message, ...fileMetadata });
    throw this.createUploadError(
      UploadErrorType.NETWORK_ERROR,
      `Network error: ${error.message}`,
      { ...fileMetadata, originalError: error }
    );
  }

  // Standard Error instances
  if (error instanceof Error) {
    logger.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      ...fileMetadata,
    });
    throw this.createUploadError(
      UploadErrorType.UNKNOWN_ERROR,
      error.message,
      { ...fileMetadata, originalError: error }
    );
  }

  // Non-Error objects (serialize safely)
  const serializedError = this.safeSerialize(error);
  logger.error('Unknown error object:', { error: serializedError, ...fileMetadata });
  throw this.createUploadError(
    UploadErrorType.UNKNOWN_ERROR,
    'An unknown error occurred during upload',
    { ...fileMetadata, originalError: serializedError }
  );
}

private safeSerialize(obj: any): any {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  }));
}

private createUploadError(
  type: UploadErrorType,
  message: string,
  details?: any
): UploadError {
  const error = new Error(message) as UploadError;
  error.type = type;
  error.details = details;
  return error;
}
```

### Error Recovery Strategies

- **Validation Errors**: Display inline error, allow user to select different file
- **Configuration Errors**: Display admin contact message, log for system administrator
- **Network Errors**: Provide retry button with exponential backoff (3 attempts)
- **Cloudinary Errors**: Display error message, log for debugging, provide retry option
- **Authentication Errors**: Redirect to login, display session expired message
- **Unknown Errors**: Display generic error, log complete details, provide support contact

## Testing Strategy

### Unit Tests

Unit tests will cover specific examples and edge cases:

- PDF validation with various file types (pdf, doc, jpg, txt)
- File size validation (0 bytes, 5MB, 10MB, 11MB)
- Mimetype validation (application/pdf, image/jpeg, text/plain)
- Error message formatting for each error type
- Cloudinary configuration detection
- File metadata extraction

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. The testing framework will be **fast-check** for TypeScript. Each property-based test will run a minimum of 100 iterations.

- **Property 1**: Generate random files with various extensions, sizes, and mimetypes; verify only valid PDFs pass validation
- **Property 2**: Upload random valid PDFs; verify all responses contain required metadata fields
- **Property 3**: Simulate random upload failures; verify all error responses include diagnostic information
- **Property 4**: Trigger random validation failures; verify error messages are specific to the failure type
- **Property 5**: Generate random upload progress sequences; verify monotonicity
- **Property 6**: Make random upload requests without auth tokens; verify all are rejected
- **Property 7**: Upload random PDFs; verify all use resource_type 'raw'
- **Property 8**: Upload random PDFs; verify all public_ids include correct folder path
- **Property 9**: Create random vacancies/tenders with PDFs; verify URLs persist to database
- **Property 10**: Generate random uploaded documents; verify preview buttons render
- **Property 11**: Throw random non-Error objects; verify they're serialized in logs
- **Property 12**: Submit random forms with PDFs; verify document URLs in payloads

### Integration Tests

- Complete upload flow from file selection to Cloudinary storage
- Error handling for Cloudinary unavailable
- Authentication and authorization flow
- PDF deletion from Cloudinary
- Mobile app PDF download functionality

## Implementation Notes

### Cloudinary Configuration for PDFs

```typescript
const CLOUDINARY_PDF_CONFIG = {
  folder: 'roads-authority/pdfs',
  resource_type: 'raw', // Critical: PDFs must use 'raw' not 'image'
  format: 'pdf',
};
```

### Progress Tracking

Use Axios with progress events:

```typescript
const uploadPDFWithProgress = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<PDFUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/upload/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 100)
      );
      onProgress(progress);
    },
  });

  return response.data.data;
};
```

### PDF Preview Implementation

```typescript
const PDFPreview: React.FC<{ url: string }> = ({ url }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Preview PDF
      </button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <iframe
            src={url}
            width="100%"
            height="600px"
            title="PDF Preview"
          />
        </Modal>
      )}
    </>
  );
};
```

### Mobile PDF Download

```typescript
const downloadPDF = async (url: string, filename: string) => {
  try {
    setLoading(true);
    
    // Open PDF in device's default viewer
    await Linking.openURL(url);
    
  } catch (error) {
    Alert.alert('Error', 'Failed to open PDF document');
    logger.error('PDF download error:', error);
  } finally {
    setLoading(false);
  }
};
```

### Performance Considerations

- Implement file size limits (10MB) to prevent memory issues
- Use streaming for large files if needed
- Implement upload timeout (60 seconds)
- Cache PDF URLs in mobile app
- Use Cloudinary CDN for fast delivery
- Implement retry logic with exponential backoff

### Security Considerations

- Validate file types on both client and server
- Implement file size limits
- Require authentication for all upload endpoints
- Validate user permissions before upload
- Sanitize filenames before storage
- Use signed URLs for sensitive documents
- Implement rate limiting for upload endpoints
- Scan uploaded files for malware (future enhancement)

### Logging Strategy

All upload operations should log:
- File metadata (name, size, type)
- User information (ID, email)
- Timestamp
- Operation result (success/failure)
- Error details (if applicable)
- Cloudinary response (public_id, url)

Example log format:
```typescript
logger.info('PDF upload initiated', {
  userId: req.user.id,
  fileName: file.originalname,
  fileSize: file.size,
  fileType: file.mimetype,
});

logger.info('PDF upload successful', {
  userId: req.user.id,
  fileName: file.originalname,
  publicId: result.public_id,
  url: result.secure_url,
  bytes: result.bytes,
});

logger.error('PDF upload failed', {
  userId: req.user.id,
  fileName: file.originalname,
  errorType: error.type,
  errorMessage: error.message,
  errorDetails: error.details,
});
```
