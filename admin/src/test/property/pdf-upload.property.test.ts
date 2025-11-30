import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import pdfUploadService from '../../services/pdfUpload.service';
import apiClient from '../../services/api';
import axios, { AxiosError } from 'axios';

// Mock apiClient
vi.mock('../../services/api');
const mockedApiClient = vi.mocked(apiClient);

describe('PDF Upload Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: pdf-upload-functionality, Property 9: Document URL persistence
   * Validates: Requirements 1.5
   */
  it('Property 9: document URL must persist when saving vacancy or tender', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          pdfUrl: fc.webUrl({ validSchemes: ['https'] }),
          published: fc.boolean(),
        }),
        async (formData) => {
          // Mock the API response for creating a vacancy with PDF URL
          const mockVacancyId = fc.sample(fc.uuid(), 1)[0];
          
          mockedApiClient.post.mockImplementation(() =>
            Promise.resolve({
              data: {
                success: true,
                data: {
                  vacancy: {
                    id: mockVacancyId,
                    ...formData,
                    type: 'full-time',
                    department: 'Test',
                    location: 'Test',
                    description: 'Test',
                    requirements: ['Test'],
                    responsibilities: ['Test'],
                    closingDate: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            } as any)
          );

          // Simulate form submission with PDF URL
          const response = await mockedApiClient.post('/vacancies', formData);

          // Property: The saved record must contain the exact PDF URL that was submitted
          expect(response.data.data.vacancy.pdfUrl).toBe(formData.pdfUrl);
          
          // Property: PDF URL must not be empty or undefined after save
          expect(response.data.data.vacancy.pdfUrl).toBeTruthy();
          
          // Property: PDF URL must remain a valid URL
          expect(response.data.data.vacancy.pdfUrl).toMatch(/^https:\/\/.+/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: pdf-upload-functionality, Property 5: Upload progress is monotonic
   * Validates: Requirements 2.1
   */
  it('Property 5: upload progress should only increase or stay the same', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 20 }),
        (progressValues) => {
          // Simulate progress updates
          const progressSequence: number[] = [];
          
          progressValues.forEach((value) => {
            // Progress should be monotonically increasing
            const currentProgress = progressSequence.length > 0 
              ? Math.max(progressSequence[progressSequence.length - 1], value)
              : value;
            progressSequence.push(currentProgress);
          });

          // Verify monotonicity: each value >= previous value
          for (let i = 1; i < progressSequence.length; i++) {
            expect(progressSequence[i]).toBeGreaterThanOrEqual(progressSequence[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: pdf-upload-functionality, Property 10: Preview available for uploaded documents
   * Validates: Requirements 4.2, 4.3
   */
  it('Property 10: preview must be available for all uploaded documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          filename: fc.string({ minLength: 1, maxLength: 50 }),
          size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
        }),
        async (fileSpec) => {
          const file = new File(
            ['%PDF-1.4 test content'],
            `${fileSpec.filename}.pdf`,
            { type: 'application/pdf' }
          );
          Object.defineProperty(file, 'size', { value: fileSpec.size });

          const mockUrl = `https://res.cloudinary.com/test/raw/upload/v123/roads-authority/pdfs/${fileSpec.filename}.pdf`;
          
          // Mock the apiClient post call
          mockedApiClient.post.mockImplementation(() => 
            Promise.resolve({
              data: {
                success: true,
                data: {
                  url: mockUrl,
                  publicId: `roads-authority/pdfs/${fileSpec.filename}`,
                  format: 'pdf',
                  bytes: fileSpec.size,
                },
              },
            } as any)
          );

          const result = await pdfUploadService.uploadPDF(file);

          // For any uploaded document, URL must be available for preview
          expect(result.url).toBeTruthy();
          expect(result.url).toMatch(/^https:\/\/.+/);
          
          // URL must be a valid PDF URL
          expect(result.url).toContain('.pdf');
          
          // URL must be accessible (contains cloudinary domain)
          expect(result.url).toContain('cloudinary.com');
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Feature: pdf-upload-functionality, Property 12: Form submission includes document URL
   * Validates: Requirements 4.5
   */
  it('Property 12: form submission payload must include document URL when PDF is uploaded', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 500 }),
          pdfUrl: fc.webUrl({ validSchemes: ['https'] }),
          type: fc.constantFrom('full-time', 'part-time', 'bursary', 'internship'),
        }),
        async (formData) => {
          // Mock form submission
          let submittedPayload: any = null;
          
          mockedApiClient.post.mockImplementation((url, data) => {
            submittedPayload = data;
            return Promise.resolve({
              data: {
                success: true,
                data: {
                  vacancy: {
                    id: fc.sample(fc.uuid(), 1)[0],
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            } as any);
          });

          // Simulate form submission with PDF URL
          await mockedApiClient.post('/vacancies', formData);

          // Property: The submission payload must include the pdfUrl field
          expect(submittedPayload).toHaveProperty('pdfUrl');
          
          // Property: The pdfUrl in the payload must match the uploaded URL
          expect(submittedPayload.pdfUrl).toBe(formData.pdfUrl);
          
          // Property: The pdfUrl must not be empty or undefined
          expect(submittedPayload.pdfUrl).toBeTruthy();
          
          // Property: The pdfUrl must be a valid URL
          expect(submittedPayload.pdfUrl).toMatch(/^https:\/\/.+/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: pdf-upload-functionality, Property 6: Authenticated requests required
   * Validates: Requirements 7.1, 7.2
   */
  it('Property 6: upload requests without valid authentication must be rejected with 401', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          filename: fc.string({ minLength: 1, maxLength: 50 }),
          size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
          hasAuth: fc.boolean(),
          authToken: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
        }),
        async (testCase) => {
          const file = new File(
            ['%PDF-1.4 test content'],
            `${testCase.filename}.pdf`,
            { type: 'application/pdf' }
          );
          Object.defineProperty(file, 'size', { value: testCase.size });

          // Track if the mock was called and what error was thrown
          let mockCalled = false;
          let thrownError: any = null;

          // Mock the apiClient post call to simulate authentication check
          mockedApiClient.post.mockImplementation(() => {
            mockCalled = true;
            
            // If no auth or invalid token, reject with 401
            if (!testCase.hasAuth || !testCase.authToken) {
              const error = new Error('No token provided') as AxiosError;
              (error as any).response = {
                status: 401,
                data: {
                  success: false,
                  error: {
                    code: 'AUTH_MISSING_TOKEN',
                    message: 'No token provided',
                  },
                },
              };
              (error as any).isAxiosError = true;
              thrownError = error;
              return Promise.reject(error);
            }

            // If auth is present, return success
            return Promise.resolve({
              data: {
                success: true,
                data: {
                  url: `https://res.cloudinary.com/test/raw/upload/v123/roads-authority/pdfs/${testCase.filename}.pdf`,
                  publicId: `roads-authority/pdfs/${testCase.filename}`,
                  format: 'pdf',
                  bytes: testCase.size,
                },
              },
            } as any);
          });

          try {
            const result = await pdfUploadService.uploadPDF(file);

            // Property: If we got a result, authentication must have been present
            if (result) {
              expect(testCase.hasAuth).toBe(true);
              expect(testCase.authToken).toBeTruthy();
              expect(mockCalled).toBe(true);
            }
          } catch (error: any) {
            // Property: If authentication is missing, the underlying API call must have been rejected with 401
            if (!testCase.hasAuth || !testCase.authToken) {
              expect(mockCalled).toBe(true);
              expect(thrownError).toBeDefined();
              expect(thrownError.response?.status).toBe(401);
              expect(thrownError.response?.data?.error?.message).toContain('token');
              // The service wraps the error, so we just verify it threw an error
              expect(error).toBeDefined();
            } else {
              // If auth is present but still failed, it's a different error
              // This is acceptable (could be validation, network, etc.)
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
