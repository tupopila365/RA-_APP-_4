# Implementation Plan

- [x] 1. Install required dependencies





  - Add `expo-sharing` package for native share functionality
  - Add `fast-check` package for property-based testing
  - Update package.json and run npm install
  - _Requirements: 4.2, 4.4_

- [x] 2. Create document download service




  - [x] 2.1 Implement core download service module


    - Create `services/documentDownloadService.js` file
    - Implement `downloadFile()` function with progress tracking using `FileSystem.createDownloadResumable()`
    - Implement `generateSafeFilename()` function with sanitization logic
    - Implement `getFilePath()` function to construct full file paths
    - Implement `fileExists()` function to check if file already exists
    - Implement `deleteFile()` function for cleanup
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

  - [x] 2.2 Write property test for filename safety


    - **Property 8: Filename safety and structure**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 2.3 Implement file opening functionality


    - Add `openFile()` function using `Linking.openURL()` with file URI
    - Handle platform-specific file URI formats
    - _Requirements: 4.1, 4.3_


  - [x] 2.4 Implement file sharing functionality

    - Add `shareFile()` function using `Sharing.shareAsync()`
    - Handle sharing errors gracefully
    - _Requirements: 4.2, 4.4_


  - [x] 2.5 Write unit tests for download service

    - Test filename generation with various inputs
    - Test file path construction
    - Test file existence checking
    - Test error handling for invalid inputs
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Create custom download hook




  - [x] 3.1 Implement useDocumentDownload hook


    - Create `hooks/useDocumentDownload.js` file
    - Manage download state (isDownloading, progress, error, downloadedUri)
    - Implement `startDownload()` function that calls the download service
    - Implement progress callback to update state
    - Implement error handling with appropriate error messages
    - Implement cleanup on unmount
    - _Requirements: 1.1, 1.2, 1.5, 2.2, 2.3_

  - [x] 3.2 Write property test for progress monotonicity


    - **Property 7: Progress monotonicity**
    - **Validates: Requirements 2.3**

  - [x] 3.3 Write property test for download button state


    - **Property 6: Download button state**
    - **Validates: Requirements 2.2**

  - [x] 3.4 Write unit tests for download hook


    - Test state management during download lifecycle
    - Test error state handling
    - Test cleanup on unmount
    - _Requirements: 1.2, 1.5, 2.2_

- [-] 4. Update TendersScreen with new download functionality




  - [x] 4.1 Integrate useDocumentDownload hook

    - Import and use the `useDocumentDownload` hook
    - Replace current `handleDownload` function with hook's `startDownload`
    - Update UI to show download progress with percentage
    - Add progress bar or percentage indicator
    - Update button text to show "Downloading X%" during download
    - Disable button during download
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_



  - [x] 4.2 Implement success handling







    - Show success alert with "Open" and "Share" buttons when download completes
    - Implement "Open" button to call `openFile()` from service
    - Implement "Share" button to call `shareFile()` from service
    - Reset download state after user dismisses alert

    - _Requirements: 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_


  - [x] 4.3 Implement error handling









    - Display specific error messages based on error type (network, invalid URL, storage, permissions)
    - Allow retry by resetting download state
    - Clean up partial downloads on error
    - _Requirements: 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_


  - [x] 4.4 Write property test for download completion consistency






    - **Property 1: Download completion consistency**
    - **Validates: Requirements 1.1**

  - [ ] 4.5 Write property test for success notification
    - **Property 3: Success notification**
    - **Validates: Requirements 1.3**

  - [ ] 4.6 Write property test for post-download actions
    - **Property 4: Post-download actions availability**
    - **Validates: Requirements 1.4**

  - [ ] 4.7 Write property test for error messages
    - **Property 5: Error message display**
    - **Validates: Requirements 1.5**

  - [ ] 4.8 Write property test for error recovery
    - **Property 9: Error recovery and retry**

    - **Validates: Requirements 5.4**

- [x] 5. Update VacanciesScreen with download functionality





  - [x] 5.1 Integrate useDocumentDownload hook in VacanciesScreen


    - Apply same download functionality as TendersScreen
    - Update UI components for progress and actions
    - Implement success and error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [-] 6. Add download progress indicator component



  - [x] 6.1 Create reusable DownloadButton component


    - Create `components/DownloadButton.js` file
    - Accept props: onPress, isDownloading, progress, disabled
    - Show download icon when idle
    - Show progress percentage when downloading
    - Show activity indicator during download
    - Apply disabled styling when downloading
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

  - [ ] 6.2 Write property test for progress indicator visibility


    - **Property 2: Progress indicator visibility**
    - **Validates: Requirements 1.2**

  - [ ] 6.3 Write unit tests for DownloadButton component
    - Test rendering in different states (idle, downloading, disabled)
    - Test progress display
    - Test button press handling
    - _Requirements: 1.2, 2.1, 2.2_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Write integration tests
  - [ ] 8.1 Write end-to-end download flow test
    - Test complete flow from button tap to file saved
    - Test open file functionality
    - Test share file functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_

  - [ ] 8.2 Write error recovery flow test
    - Test retry after network error
    - Test retry after invalid URL error
    - Test cleanup after errors
    - _Requirements: 1.5, 5.1, 5.2, 5.4_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
