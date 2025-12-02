# Requirements Document

## Introduction

This specification addresses the critical issue where the RAG service cannot download PDF documents from Cloudinary due to 401 Unauthorized errors. When documents are uploaded to Cloudinary as "raw" resource type, the generated URLs require authentication that the RAG service currently does not provide. This prevents document indexing and breaks the chatbot's ability to answer questions about uploaded documents.

## Glossary

- **RAG Service**: The Retrieval-Augmented Generation service that processes and indexes documents for the chatbot
- **Cloudinary**: Cloud-based media management platform used for storing uploaded files
- **PDF Processor**: Component within the RAG service responsible for downloading and extracting text from PDF documents
- **Backend Service**: Node.js/TypeScript service that handles document uploads and communicates with the RAG service
- **Resource Type**: Cloudinary classification for uploaded files (image, video, raw, auto)
- **Public ID**: Unique identifier assigned by Cloudinary to each uploaded resource
- **Signed URL**: Time-limited authenticated URL that grants temporary access to private Cloudinary resources

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want PDF documents to be accessible by the RAG service without authentication errors, so that documents can be successfully indexed and made searchable.

#### Acceptance Criteria

1. WHEN a PDF is uploaded to Cloudinary THEN the system SHALL generate a URL that the RAG service can access without authentication
2. WHEN the RAG service attempts to download a PDF THEN the system SHALL provide valid credentials or a signed URL
3. WHEN a PDF download is attempted THEN the system SHALL NOT receive a 401 Unauthorized error
4. WHEN the Backend Service sends a document URL to the RAG service THEN the URL SHALL remain valid for the duration of the indexing process
5. WHEN Cloudinary credentials are configured THEN the system SHALL validate they are correct before attempting uploads

### Requirement 2

**User Story:** As a developer, I want the PDF upload configuration to use appropriate Cloudinary settings, so that uploaded documents are publicly accessible or properly authenticated.

#### Acceptance Criteria

1. WHEN uploading a PDF to Cloudinary THEN the system SHALL configure the resource with appropriate access permissions
2. WHEN configuring Cloudinary upload options THEN the system SHALL specify the correct resource type for PDFs
3. WHEN a PDF is stored in Cloudinary THEN the system SHALL use settings that allow programmatic access by the RAG service
4. IF signed URLs are required THEN the system SHALL generate URLs with sufficient expiration time for processing
5. WHEN upload configuration is changed THEN the system SHALL maintain backward compatibility with existing documents

### Requirement 3

**User Story:** As a system, I want to handle Cloudinary authentication properly in the RAG service, so that private resources can be accessed when needed.

#### Acceptance Criteria

1. WHEN the RAG service downloads a PDF THEN the system SHALL include necessary authentication headers if required
2. WHEN Cloudinary credentials are available THEN the RAG service SHALL use them for authenticated requests
3. WHEN downloading from a signed URL THEN the system SHALL preserve all query parameters and signatures
4. WHEN authentication fails THEN the system SHALL provide clear error messages indicating the authentication issue
5. WHEN retrying failed downloads THEN the system SHALL NOT exhaust retry attempts on authentication errors without investigation

### Requirement 4

**User Story:** As a developer, I want comprehensive error handling and logging for PDF access issues, so that I can quickly diagnose and resolve problems.

#### Acceptance Criteria

1. WHEN a PDF download fails with 401 error THEN the system SHALL log the URL, error details, and authentication status
2. WHEN Cloudinary returns an error THEN the system SHALL capture and log the complete error response
3. WHEN investigating access issues THEN the logs SHALL contain sufficient information to identify the root cause
4. WHEN an authentication error occurs THEN the system SHALL distinguish it from network or other errors
5. WHEN errors are logged THEN the system SHALL include timestamps, document IDs, and relevant context

### Requirement 5

**User Story:** As a system administrator, I want existing uploaded documents to work after the fix is applied, so that no manual intervention is required for historical data.

#### Acceptance Criteria

1. WHEN the fix is deployed THEN existing document URLs SHALL continue to function
2. WHEN processing old documents THEN the system SHALL handle both old and new URL formats
3. WHEN a document was uploaded before the fix THEN the system SHALL still be able to index it
4. IF URL migration is needed THEN the system SHALL provide a migration path for existing documents
5. WHEN backward compatibility is maintained THEN the system SHALL NOT break existing functionality
