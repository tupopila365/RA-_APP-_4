# Implementation Plan

- [x] 1. Configure Cloudinary upload for public PDF access




  - [x] 1.1 Update uploadPDF method to include type: 'upload' parameter


    - Modify the Cloudinary upload options in `backend/src/modules/upload/upload.service.ts`
    - Add `type: 'upload'` to make PDFs publicly accessible
    - Ensure resource_type remains 'raw' for PDF files
    - _Requirements: 1.1, 2.1, 2.2, 2.3_

  - [ ]* 1.2 Write property test for public URL accessibility
    - **Property 1: Uploaded PDFs generate accessible URLs**
    - **Validates: Requirements 1.1, 2.3**

  - [ ]* 1.3 Write property test for correct resource type configuration
    - **Property 4: Upload configuration includes correct resource type**
    - **Validates: Requirements 2.2**

- [x] 2. Add URL validation to upload service





  - [x] 2.1 Create URL accessibility validation utility


    - Add `validateURLAccess()` function in `backend/src/config/cloudinary.ts`
    - Implement HTTP HEAD request to verify URL is accessible
    - Return boolean indicating accessibility status
    - _Requirements: 1.1, 1.3_

  - [x] 2.2 Integrate URL validation into upload flow


    - Call validation after successful Cloudinary upload
    - Log validation results
    - Throw error if URL is not accessible
    - _Requirements: 1.1, 1.3_

  - [ ]* 2.3 Write property test for URL accessibility
    - **Property 2: PDF downloads do not return 401 errors**
    - **Validates: Requirements 1.3**

  - [ ]* 2.4 Write unit tests for URL validation utility
    - Test successful validation with accessible URLs
    - Test failure detection with 401 responses
    - Test timeout handling
    - _Requirements: 1.1, 1.3_

- [x] 3. Enhance RAG service error handling for authentication errors




  - [x] 3.1 Improve PDF processor error categorization


    - Update `download_pdf()` method in `rag-service/app/services/pdf_processor.py`
    - Add specific handling for 401 and 403 errors
    - Create distinct error codes for authentication issues
    - Improve error messages to indicate authentication problems
    - _Requirements: 3.4, 4.1, 4.4_

  - [x] 3.2 Enhance error logging with detailed context


    - Add URL logging for failed downloads
    - Include HTTP status code in error logs
    - Add authentication status to log context
    - Include document ID in error messages
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ]* 3.3 Write property test for error categorization
    - **Property 8: Error categorization distinguishes authentication errors**
    - **Validates: Requirements 4.4**

  - [ ]* 3.4 Write property test for error logging completeness
    - **Property 9: Error logs contain required context**
    - **Validates: Requirements 4.5**

- [x] 4. Update retry logic to handle authentication errors appropriately




  - [x] 4.1 Modify retry logic in PDF processor


    - Update `download_pdf()` method to not retry on 401/403 errors
    - Keep retry logic for network and 5xx errors
    - Add clear logging when skipping retry due to auth errors
    - _Requirements: 3.5, 4.4_

  - [ ]* 4.2 Write unit tests for retry logic
    - Test that 401 errors do not trigger retries
    - Test that network errors do trigger retries
    - Test exponential backoff for retryable errors
    - _Requirements: 3.5_

- [x] 5. Add optional signed URL support (alternative approach)





  - [x] 5.1 Create signed URL generation utility


    - Add `generateSignedURL()` function in `backend/src/config/cloudinary.ts`
    - Use Cloudinary SDK to generate signed URLs
    - Support configurable expiration time
    - Default to 24 hours expiration
    - _Requirements: 1.2, 1.4, 2.4_

  - [x] 5.2 Add configuration option for access mode


    - Add `CLOUDINARY_PDF_ACCESS_MODE` environment variable
    - Support values: 'public', 'signed'
    - Update upload service to use signed URLs when configured
    - _Requirements: 1.2, 2.4_

  - [ ]* 5.3 Write property test for signed URL generation
    - **Property 3: URLs remain valid during processing**
    - **Validates: Requirements 1.4**

  - [ ]* 5.4 Write property test for URL parameter preservation
    - **Property 7: Signed URLs preserve all parameters**
    - **Validates: Requirements 3.3**

- [x] 6. Add backward compatibility for existing documents





  - [x] 6.1 Ensure PDF processor handles various URL formats


    - Test with existing Cloudinary URL formats
    - Ensure query parameters are preserved
    - Handle both signed and unsigned URLs
    - _Requirements: 5.2_

  - [ ]* 6.2 Write property test for URL format handling
    - **Property 11: Multiple URL formats are handled**
    - **Validates: Requirements 5.2**

  - [ ]* 6.3 Write integration tests for backward compatibility
    - Test processing of old document URLs
    - Test processing of new document URLs
    - Verify both formats work correctly
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Update configuration and documentation





  - [x] 7.1 Add environment variable documentation


    - Update `.env.example` with new configuration options
    - Document CLOUDINARY_PDF_ACCESS_MODE options
    - Document CLOUDINARY_SIGNED_URL_EXPIRY setting
    - _Requirements: 1.5_

  - [x] 7.2 Create migration guide for existing deployments


    - Document steps to update existing documents
    - Provide script or instructions for re-indexing
    - Document rollback procedure
    - _Requirements: 5.1, 5.4_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
