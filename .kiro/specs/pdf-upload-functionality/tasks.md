# Implementation Plan

- [x] 1. Implement improved error handling in upload service





  - [x] 1.1 Create UploadError type and UploadErrorType enum


    - Define error types (VALIDATION_ERROR, CONFIGURATION_ERROR, NETWORK_ERROR, CLOUDINARY_ERROR, AUTHENTICATION_ERROR, UNKNOWN_ERROR)
    - Create UploadError interface extending Error with type and details fields
    - _Requirements: 1.4, 5.2_

  - [x] 1.2 Implement error creation and serialization utilities


    - Create createUploadError helper function
    - Implement safeSerialize function to handle circular references
    - Add error metadata extraction
    - _Requirements: 5.5_

  - [x] 1.3 Write property test for error serialization



    - **Property 11: Unknown errors are serialized**
    - **Validates: Requirements 5.5**



  - [x] 1.4 Refactor uploadPDF error handling




    - Replace generic error throwing with typed errors
    - Add specific error detection for Cloudinary, network, and configuration errors
    - Include file metadata in all error logs


    - Implement proper error logging with structured data
    - _Requirements: 1.4, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.5 Write property test for upload error diagnostics





    - **Property 3: Upload errors include diagnostic information**
    - **Validates: Requirements 1.4, 5.2, 5.4**

- [-] 2. Fix PDF validation and upload flow



  - [x] 2.1 Review and fix validatePDF method


    - Ensure file type validation checks .pdf extension
    - Ensure mimetype validation checks application/pdf
    - Ensure size validation checks 10MB limit
    - Return specific error messages for each validation failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Write property test for PDF validation


    - **Property 1: PDF validation accepts only valid PDFs**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 2.3 Write property test for validation error specificity


    - **Property 4: Validation errors are specific**
    - **Validates: Requirements 3.4**

  - [x] 2.4 Verify Cloudinary configuration for PDFs


    - Ensure resource_type is set to 'raw' for PDF uploads
    - Verify folder path is 'roads-authority/pdfs'
    - Add configuration validation before upload
    - _Requirements: 7.3, 7.4_

  - [x] 2.5 Write property test for Cloudinary raw resource type


    - **Property 7: Cloudinary uses raw resource type**
    - **Validates: Requirements 7.3**

  - [x] 2.6 Write property test for PDF folder structure







    - **Property 8: PDFs stored in dedicated folder**
    - **Validates: Requirements 7.4**

  - [x] 2.7 Ensure successful uploads return complete metadata





    - Verify response includes url, publicId, format, and bytes
    - Add response validation
    - _Requirements: 1.3_

  - [x] 2.8 Write property test for upload metadata completeness





    - **Property 2: Successful uploads return complete metadata**
    - **Validates: Requirements 1.3**

- [x] 3. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Enhance PDF upload service in admin dashboard





  - [x] 4.1 Create or update PDFUploadField component


    - Implement file input with PDF-specific validation
    - Add upload progress tracking
    - Display document information after upload
    - Show error messages with specific failure reasons
    - Add remove and re-upload functionality
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.4_

  - [x] 4.2 Write property test for upload progress monotonicity


    - **Property 5: Upload progress is monotonic**
    - **Validates: Requirements 2.1**

  - [x] 4.3 Implement PDF upload service with progress tracking


    - Create uploadPDF function with Axios progress events
    - Implement client-side validation
    - Add error handling and retry logic
    - Handle upload timeout (60 seconds)
    - _Requirements: 2.1, 2.5, 3.5_

  - [x] 4.4 Create or update PDFPreview component


    - Implement modal viewer for PDF preview
    - Add iframe for document display
    - Include action buttons (close, download)
    - Handle preview errors gracefully
    - _Requirements: 4.2, 4.3_

  - [x] 4.5 Write property test for preview availability


    - **Property 10: Preview available for uploaded documents**
    - **Validates: Requirements 4.2, 4.3**

- [x] 5. Update vacancy and tender forms





  - [x] 5.1 Integrate PDFUploadField into VacancyForm


    - Replace or add PDF upload field
    - Wire document URL to form state
    - Ensure form submission includes document URL
    - Test upload and form submission flow
    - _Requirements: 1.5, 4.5_

  - [x] 5.2 Integrate PDFUploadField into TenderForm


    - Replace or add PDF upload field
    - Wire document URL to form state
    - Ensure form submission includes document URL
    - Test upload and form submission flow
    - _Requirements: 1.5, 4.5_

  - [x] 5.3 Write property test for document URL persistence


    - **Property 9: Document URL persistence**
    - **Validates: Requirements 1.5**

  - [x] 5.4 Write property test for form submission includes URL


    - **Property 12: Form submission includes document URL**
    - **Validates: Requirements 4.5**

- [-] 6. Implement authentication and authorization checks



  - [x] 6.1 Verify authentication middleware on upload routes


    - Ensure /api/upload/pdf requires authentication
    - Test unauthenticated requests are rejected with 401
    - _Requirements: 7.1_

  - [x] 6.2 Add authorization checks for upload permissions


    - Verify user has permission to upload documents
    - Return 403 for unauthorized users
    - _Requirements: 7.2_


  - [x] 6.3 Write property test for authentication requirement







    - **Property 6: Authenticated requests required**
    - **Validates: Requirements 7.1, 7.2**

- [x] 7. Implement mobile app PDF download functionality





  - [x] 7.1 Add PDF download button to vacancy detail screen


    - Display download button when PDF URL exists
    - Hide button when URL is invalid or missing
    - Show loading indicator during download
    - Handle download errors with error messages
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 7.2 Add PDF download button to tender detail screen


    - Display download button when PDF URL exists
    - Hide button when URL is invalid or missing
    - Show loading indicator during download
    - Handle download errors with error messages
    - _Requirements: 6.2, 6.4, 6.5_

  - [x] 7.3 Implement PDF download functionality

    - Use Linking.openURL to open PDF in device viewer
    - Add error handling for failed downloads
    - Implement loading state management
    - _Requirements: 6.3_

  - [x] 7.4 Write unit tests for mobile PDF download


    - Test download button rendering
    - Test download action
    - Test error handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Add comprehensive logging





  - [x] 8.1 Implement structured logging for upload operations


    - Log upload initiation with file metadata and user info
    - Log successful uploads with Cloudinary response
    - Log failed uploads with error details and file metadata
    - Use consistent log format across all operations
    - _Requirements: 5.2, 5.4_

  - [x] 8.2 Add logging to PDF deletion operations


    - Log deletion requests with publicId and user info
    - Log successful deletions
    - Log failed deletions with error details
    - _Requirements: 7.5_

- [x] 9. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
