# Implementation Plan

- [x] 1. Update upload service to require Google Drive for PDF uploads








  - [x] 1.1 Add Google Drive configuration validation


    - Create `validateGoogleDriveConfiguration()` method in `backend/src/modules/upload/upload.service.ts`
    - Check for required environment variables (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
    - Throw `CONFIGURATION_ERROR` with HTTP 503 if not configured
    - Log specific missing configuration fields
    - _Requirements: 1.5, 2.1, 2.3_


  - [x] 1.2 Modify uploadPDF to require Google Drive


    - Call `validateGoogleDriveConfiguration()` at the start of `uploadPDF()`
    - Remove fallback logic that allows Cloudinary-only uploads
    - Ensure Google Drive upload happens first and is required
    - Make Cloudinary upload optional (for display purposes only)

    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Update ragDownloadUrl to always use Google Drive


    - Set `ragDownloadUrl` to Google Drive direct download link
    - Remove conditional logic that falls back to Cloudinary URL

    - Ensure `googleDriveFileId` and `googleDriveUrl` are always populated
    - _Requirements: 1.1, 1.4_

  - [x] 1.4 Enhance error handling for Google Drive failures


    - Catch Google Drive upload errors and wrap in `GOOGLE_DRIVE_ERROR`
    - Log file metadata and Google Drive error response
    - Return HTTP 500 with descriptive error message
    - Do not proceed with upload if Google Drive fails
    - _Requirements: 1.2, 2.2_

  - [ ]* 1.5 Write property test for ragDownloadUrl format
    - **Property 1: ragDownloadUrl contains Google Drive URL**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 1.6 Write property test for upload failure on Google Drive error
    - **Property 2: Upload fails when Google Drive fails**
    - **Validates: Requirements 1.2**

  - [ ]* 1.7 Write property test for configuration error logging
    - **Property 4: Configuration error logs contain missing fields**
    - **Validates: Requirements 2.1**

  - [ ]* 1.8 Write property test for upload failure logging
    - **Property 5: Upload failure logs contain metadata**
    - **Validates: Requirements 2.2**

- [ ] 2. Update RAG service to prefer Google Drive URLs
  - [ ] 2.1 Add URL source detection
    - Create `_detect_url_source()` method in `rag-service/app/services/pdf_processor.py`
    - Detect Google Drive URLs (pattern: drive.google.com)
    - Detect Cloudinary URLs (pattern: res.cloudinary.com)
    - Return 'google_drive', 'cloudinary', or 'unknown'
    - _Requirements: 3.1, 4.1_

  - [ ] 2.2 Add storage backend logging
    - Log URL source before download attempt
    - Log "Using Google Drive for PDF download" or "Using Cloudinary for PDF download"
    - Include document ID in log context
    - _Requirements: 4.1, 4.4_

  - [ ] 2.3 Add migration warnings for Cloudinary URLs
    - Detect Cloudinary URLs in `download_pdf()`
    - Log warning: "Processing PDF from Cloudinary URL - migration to Google Drive recommended"
    - Include document ID and URL in warning
    - _Requirements: 3.2_

  - [ ] 2.4 Enhance download logging with metrics
    - Track download start time
    - Log file size after successful download
    - Calculate and log download duration
    - Include URL source in success logs
    - _Requirements: 4.2_

  - [ ] 2.5 Update error messages for Cloudinary failures
    - Detect Cloudinary URL download failures
    - Add migration recommendation to error message
    - Log "Cloudinary download failed - consider migrating to Google Drive"
    - _Requirements: 3.4_

  - [ ]* 2.6 Write property test for Google Drive URL usage
    - **Property 3: RAG service uses Google Drive URLs**
    - **Validates: Requirements 1.3**

  - [ ]* 2.7 Write property test for Cloudinary fallback
    - **Property 7: Cloudinary URLs work as fallback**
    - **Validates: Requirements 3.1**

  - [ ]* 2.8 Write property test for migration warnings
    - **Property 8: Cloudinary URLs trigger migration warning**
    - **Validates: Requirements 3.2**

  - [ ]* 2.9 Write property test for URL preference
    - **Property 9: Google Drive preferred over Cloudinary**
    - **Validates: Requirements 3.3**

  - [ ]* 2.10 Write property test for Cloudinary failure messages
    - **Property 10: Cloudinary failure mentions migration**
    - **Validates: Requirements 3.4**

  - [ ]* 2.11 Write property test for download source logging
    - **Property 11: Download logs contain source**
    - **Validates: Requirements 4.1**

  - [ ]* 2.12 Write property test for success metrics logging
    - **Property 12: Success logs contain metrics**
    - **Validates: Requirements 4.2**

  - [ ]* 2.13 Write property test for failure logging completeness
    - **Property 13: Failure logs contain complete error info**
    - **Validates: Requirements 4.3**

  - [ ]* 2.14 Write property test for backend logging
    - **Property 14: Processing logs contain backend info**
    - **Validates: Requirements 4.4**

  - [ ]* 2.15 Write property test for download failure logging
    - **Property 6: Download failure logs contain URL and error**
    - **Validates: Requirements 2.4**

- [ ] 3. Update PDFUploadResult interface
  - [ ] 3.1 Make Google Drive fields required
    - Update `PDFUploadResult` interface in `backend/src/modules/upload/upload.service.ts`
    - Change `googleDriveFileId` from optional to required
    - Change `googleDriveUrl` from optional to required
    - Ensure `ragDownloadUrl` is always populated
    - _Requirements: 1.1, 1.4_

  - [ ] 3.2 Make Cloudinary fields optional
    - Change `url` to optional (Cloudinary display URL)
    - Change `publicId` to optional (Cloudinary public ID)
    - Update TypeScript types accordingly
    - _Requirements: 1.1_

- [ ] 4. Update environment configuration documentation
  - [ ] 4.1 Update .env.example files
    - Mark Google Drive variables as required for PDF uploads
    - Mark Cloudinary variables as optional
    - Add comments explaining the change
    - _Requirements: 1.5_

  - [ ] 4.2 Create migration guide
    - Document the change from Cloudinary to Google Drive
    - Provide steps for configuring Google Drive
    - Explain backward compatibility with Cloudinary URLs
    - Include script or instructions for re-uploading legacy PDFs
    - _Requirements: 3.1, 3.2_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
