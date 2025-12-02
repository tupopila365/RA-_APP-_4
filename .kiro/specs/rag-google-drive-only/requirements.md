# Requirements Document

## Introduction

This feature modifies the RAG (Retrieval-Augmented Generation) service to download PDF documents exclusively from Google Drive instead of Cloudinary. Currently, the system uploads PDFs to both Cloudinary and Google Drive, with the RAG service using whichever URL is available. This change ensures that all RAG PDF downloads occur through Google Drive, providing more reliable access and avoiding Cloudinary's bot detection and authentication issues.

## Glossary

- **RAG Service**: The Retrieval-Augmented Generation service that processes PDF documents for chatbot queries
- **Google Drive**: Cloud storage service used for storing and serving PDF documents
- **Cloudinary**: Cloud-based image and video management service (currently used for PDF storage)
- **Upload Service**: Backend service responsible for uploading files to cloud storage
- **PDF Processor**: Component within the RAG service that downloads and extracts text from PDFs
- **ragDownloadUrl**: The URL field in the database that the RAG service uses to download PDFs
- **Direct Download Link**: A Google Drive URL format that allows direct file downloads without authentication

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the RAG service to download PDFs exclusively from Google Drive, so that PDF processing is reliable and avoids Cloudinary authentication issues.

#### Acceptance Criteria

1. WHEN a PDF is uploaded THEN the system SHALL store the Google Drive direct download link as the ragDownloadUrl
2. WHEN Google Drive upload fails THEN the system SHALL reject the PDF upload and return an error
3. WHEN the RAG service processes a document THEN the system SHALL download the PDF from the Google Drive URL
4. WHEN the ragDownloadUrl field is accessed THEN the system SHALL contain a valid Google Drive direct download link
5. WHERE Google Drive is not configured THEN the system SHALL prevent PDF uploads and return a configuration error

### Requirement 2

**User Story:** As a developer, I want clear error messages when Google Drive is unavailable, so that I can quickly diagnose and fix configuration issues.

#### Acceptance Criteria

1. WHEN Google Drive credentials are missing THEN the system SHALL log a configuration error with specific missing fields
2. WHEN Google Drive upload fails THEN the system SHALL log the error with file metadata and Google Drive response details
3. WHEN a PDF upload is attempted without Google Drive configured THEN the system SHALL return an HTTP 503 error with a descriptive message
4. WHEN the RAG service cannot download from Google Drive THEN the system SHALL log the URL and error details

### Requirement 3

**User Story:** As a system operator, I want existing Cloudinary PDFs to continue working during migration, so that the system remains functional while transitioning to Google Drive.

#### Acceptance Criteria

1. WHEN the RAG service encounters a Cloudinary URL THEN the system SHALL attempt to download from Cloudinary as a fallback
2. WHEN processing a document with a Cloudinary ragDownloadUrl THEN the system SHALL log a migration warning
3. WHEN both Google Drive and Cloudinary URLs exist THEN the system SHALL prefer the Google Drive URL
4. WHEN a Cloudinary URL download fails THEN the system SHALL provide clear error messages indicating migration is needed

### Requirement 4

**User Story:** As a developer, I want comprehensive logging for PDF downloads, so that I can monitor the transition from Cloudinary to Google Drive.

#### Acceptance Criteria

1. WHEN a PDF is downloaded THEN the system SHALL log the URL source (Google Drive or Cloudinary)
2. WHEN a download succeeds THEN the system SHALL log the file size and download duration
3. WHEN a download fails THEN the system SHALL log the URL, error type, and HTTP status code
4. WHEN the RAG service starts processing THEN the system SHALL log which storage backend is being used
