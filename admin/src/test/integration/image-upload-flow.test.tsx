import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../test-utils';
import NewsForm from '../../pages/News/NewsForm';
import BannerForm from '../../pages/Banners/BannerForm';
import apiClient from '../../services/api';

// Mock the API client
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Image Upload Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Upload Flow', () => {
    it('should complete full upload flow in NewsForm', async () => {
      const user = userEvent.setup();
      const mockImageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';

      // Mock successful upload
      (apiClient.post as any).mockResolvedValue({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      });

      // Mock successful form submission
      (apiClient.post as any).mockResolvedValueOnce({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      }).mockResolvedValueOnce({
        data: {
          id: 1,
          title: 'Test News',
          content: 'Test content',
          imageUrl: mockImageUrl,
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      // Fill in form fields
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test News Article');

      // Upload image
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      // Wait for upload to complete
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify image preview is displayed
      const previewImage = screen.getByAltText('Preview');
      expect(previewImage).toHaveAttribute('src', mockImageUrl);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
      await user.click(submitButton);

      // Verify form submission included image URL
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            imageUrl: mockImageUrl,
          })
        );
      });
    });

    it('should complete full upload flow in BannerForm', async () => {
      const user = userEvent.setup();
      const mockImageUrl = 'https://res.cloudinary.com/test/image/upload/v123/banner.jpg';

      (apiClient.post as any).mockResolvedValue({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <BannerForm />
        </BrowserRouter>
      );

      // Upload banner image
      const file = new File(['banner'], 'banner.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      // Wait for upload and preview
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      });

      expect(screen.getByAltText('Preview')).toHaveAttribute('src', mockImageUrl);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockRejectedValue({
        isAxiosError: true,
        response: undefined,
        message: 'Network Error',
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      await waitFor(() => {
        expect(screen.getByText(/network error|upload failed/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });

    it('should handle timeout errors', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      await waitFor(() => {
        expect(screen.getByText(/timeout|upload failed/i)).toBeInTheDocument();
      });
    });

    it('should handle Cloudinary service errors', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 503,
          data: { error: 'Service Unavailable' },
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      await waitFor(() => {
        expect(screen.getByText(/service unavailable|upload failed/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      await waitFor(() => {
        expect(screen.getByText(/unauthorized|authentication|upload failed/i)).toBeInTheDocument();
      });
    });

    it('should recover from error and allow retry', async () => {
      const user = userEvent.setup();
      const mockImageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';

      // First attempt fails, second succeeds
      (apiClient.post as any)
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          data: {
            data: {
              url: mockImageUrl,
            },
          },
        });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      });

      expect(screen.getByAltText('Preview')).toHaveAttribute('src', mockImageUrl);
    });
  });

  describe('Slow Network Simulation', () => {
    it('should show progress indicator on slow upload', async () => {
      const user = userEvent.setup();
      let progressCallback: ((progress: number) => void) | null = null;

      (apiClient.post as any).mockImplementation((url: string, data: any, config: any) => {
        progressCallback = config.onUploadProgress;
        
        return new Promise((resolve) => {
          // Simulate slow upload with progress updates
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (progressCallback) {
              progressCallback({ loaded: progress, total: 100 } as any);
            }
            if (progress >= 100) {
              clearInterval(interval);
              resolve({
                data: {
                  data: {
                    url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
                  },
                },
              });
            }
          }, 100);
        });
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });

      // Should show progress
      await waitFor(() => {
        const progressText = screen.queryByText(/\d+%/);
        expect(progressText).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should disable submit button during upload', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                data: {
                  url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
                },
              },
            });
          }, 1000);
        });
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file);

      // Browse button should be disabled during upload
      await waitFor(() => {
        const browseButton = screen.getByText('Browse Files');
        expect(browseButton).toBeDisabled();
      });
    });
  });

  describe('Multiple File Uploads', () => {
    it('should handle sequential uploads independently', async () => {
      const user = userEvent.setup();
      const mockImageUrl1 = 'https://res.cloudinary.com/test/image/upload/v123/test1.jpg';
      const mockImageUrl2 = 'https://res.cloudinary.com/test/image/upload/v123/test2.jpg';

      (apiClient.post as any)
        .mockResolvedValueOnce({
          data: {
            data: {
              url: mockImageUrl1,
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: {
              url: mockImageUrl2,
            },
          },
        });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      // Upload first image
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, file1);

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toHaveAttribute('src', mockImageUrl1);
      });

      // Remove first image
      const removeButton = screen.getByText(/remove image/i);
      await user.click(removeButton);

      // Upload second image
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      await user.upload(imageInput, file2);

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toHaveAttribute('src', mockImageUrl2);
      });

      // Verify both uploads were tracked independently
      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should reject files at exactly the size limit boundary', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      // Create file exactly at 5MB + 1 byte
      const oversizedFile = new File(
        [new ArrayBuffer(5 * 1024 * 1024 + 1)],
        'large.jpg',
        { type: 'image/jpeg' }
      );

      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, oversizedFile);

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds|too large/i)).toBeInTheDocument();
      });
    });

    it('should accept files just under the size limit', async () => {
      const user = userEvent.setup();
      const mockImageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';

      (apiClient.post as any).mockResolvedValue({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      });

      renderWithProviders(
        <BrowserRouter>
          <NewsForm />
        </BrowserRouter>
      );

      // Create file just under 5MB
      const validFile = new File(
        [new ArrayBuffer(5 * 1024 * 1024 - 1024)],
        'valid.jpg',
        { type: 'image/jpeg' }
      );

      const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
      await user.upload(imageInput, validFile);

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText(/file size exceeds/i)).not.toBeInTheDocument();
      });

      // Should proceed with upload
      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      });
    });

    it('should validate all supported image formats', async () => {
      const user = userEvent.setup();
      const mockImageUrl = 'https://res.cloudinary.com/test/image/upload/v123/test.jpg';

      (apiClient.post as any).mockResolvedValue({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      });

      const formats = [
        { ext: 'jpg', type: 'image/jpeg' },
        { ext: 'png', type: 'image/png' },
        { ext: 'gif', type: 'image/gif' },
        { ext: 'webp', type: 'image/webp' },
      ];

      for (const format of formats) {
        vi.clearAllMocks();

        renderWithProviders(
          <BrowserRouter>
            <NewsForm />
          </BrowserRouter>
        );

        const file = new File(['test'], `test.${format.ext}`, { type: format.type });
        const imageInput = screen.getByLabelText(/featured image/i, { selector: 'input[type="file"]' });
        await user.upload(imageInput, file);

        await waitFor(() => {
          expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
        });
      }
    });
  });
});
