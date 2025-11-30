import React from 'react';
import { render } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { DownloadButton } from '../DownloadButton';

/**
 * Feature: mobile-document-download, Property 2: Progress indicator visibility
 * 
 * Property: For any download in progress, the Mobile App SHALL display a progress indicator
 * showing the download percentage.
 * 
 * Validates: Requirements 1.2
 */
describe('Property-Based Tests: DownloadButton Component', () => {
  describe('Property 2: Progress indicator visibility', () => {
    it('should display progress indicator when isDownloading is true for any progress value', () => {
      fc.assert(
        fc.property(
          // Generate random progress values between 0 and 100
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            // Render the component with isDownloading=true
            const { queryByTestId } = render(
              <DownloadButton
                onPress={() => {}}
                isDownloading={true}
                progress={progress}
                testID="download-button"
              />
            );

            // Property: Progress indicator container MUST be visible when downloading
            const progressContainer = queryByTestId('download-button-progress-container');
            expect(progressContainer).toBeTruthy();

            // Property: Progress bar MUST be visible when downloading
            const progressBar = queryByTestId('download-button-progress-bar');
            expect(progressBar).toBeTruthy();

            // Property: Activity indicator MUST be visible when downloading
            const activityIndicator = queryByTestId('download-button-activity-indicator');
            expect(activityIndicator).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT display progress indicator when isDownloading is false for any progress value', () => {
      fc.assert(
        fc.property(
          // Generate random progress values between 0 and 100
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            // Render the component with isDownloading=false
            const { queryByTestId } = render(
              <DownloadButton
                onPress={() => {}}
                isDownloading={false}
                progress={progress}
                testID="download-button"
              />
            );

            // Property: Progress indicator container MUST NOT be visible when not downloading
            const progressContainer = queryByTestId('download-button-progress-container');
            expect(progressContainer).toBeNull();

            // Property: Progress bar MUST NOT be visible when not downloading
            const progressBar = queryByTestId('download-button-progress-bar');
            expect(progressBar).toBeNull();

            // Property: Activity indicator MUST NOT be visible when not downloading
            const activityIndicator = queryByTestId('download-button-activity-indicator');
            expect(activityIndicator).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display correct progress percentage text for any progress value when downloading', () => {
      fc.assert(
        fc.property(
          // Generate random progress values between 0 and 100
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            // Render the component with isDownloading=true
            const { getByText } = render(
              <DownloadButton
                onPress={() => {}}
                isDownloading={true}
                progress={progress}
                testID="download-button"
              />
            );

            // Property: Button text MUST show "Downloading X%" where X is the progress value
            const expectedText = `Downloading ${progress}%`;
            const buttonText = getByText(expectedText);
            expect(buttonText).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display download icon when not downloading regardless of progress value', () => {
      fc.assert(
        fc.property(
          // Generate random progress values between 0 and 100
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            // Render the component with isDownloading=false
            const { getByText, queryByTestId } = render(
              <DownloadButton
                onPress={() => {}}
                isDownloading={false}
                progress={progress}
                label="Download Document"
                testID="download-button"
              />
            );

            // Property: Button text MUST show the label when not downloading
            const buttonText = getByText('Download Document');
            expect(buttonText).toBeTruthy();

            // Property: Activity indicator MUST NOT be visible
            const activityIndicator = queryByTestId('download-button-activity-indicator');
            expect(activityIndicator).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure progress indicator visibility is mutually exclusive with idle state', () => {
      fc.assert(
        fc.property(
          // Generate random boolean for isDownloading and random progress
          fc.boolean(),
          fc.integer({ min: 0, max: 100 }),
          (isDownloading, progress) => {
            // Render the component
            const { queryByTestId, getByText, queryByText } = render(
              <DownloadButton
                onPress={() => {}}
                isDownloading={isDownloading}
                progress={progress}
                label="Download Document"
                testID="download-button"
              />
            );

            const progressContainer = queryByTestId('download-button-progress-container');
            const activityIndicator = queryByTestId('download-button-activity-indicator');
            const downloadingText = queryByText(`Downloading ${progress}%`);
            const idleText = queryByText('Download Document');

            if (isDownloading) {
              // Property: When downloading, progress indicators MUST be visible
              expect(progressContainer).toBeTruthy();
              expect(activityIndicator).toBeTruthy();
              expect(downloadingText).toBeTruthy();
              // Property: When downloading, idle text MUST NOT be visible
              expect(idleText).toBeNull();
            } else {
              // Property: When not downloading, progress indicators MUST NOT be visible
              expect(progressContainer).toBeNull();
              expect(activityIndicator).toBeNull();
              expect(downloadingText).toBeNull();
              // Property: When not downloading, idle text MUST be visible
              expect(idleText).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
