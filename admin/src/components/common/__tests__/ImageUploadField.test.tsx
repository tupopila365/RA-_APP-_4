import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../../test/test-utils';
import ImageUploadField from '../ImageUploadField';
import apiClient from '../../../services/api';

// Mock the API client
vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('ImageUploadField', () => {
  const mockOnChange = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file input with drag-and-drop area', () => {
    renderWithProviders(
      <ImageUploadField onChange={mockOnChange} label="Upload Image" />
    );

    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText(/drag and drop an image here/i)).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  it('should display validation error for invalid file type', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImageUploadField onChange={mockOnChange} />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for file size exceeding limit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ImageUploadField onChange={mockOnChange} maxSizeMB={1} />);

    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/file size exceeds/i)).toBeInTheDocument();
    });
  });

  it('should show upload progress during upload', async () => {
    const user = userEvent.setup();
    
    // Mock API response with progress
    (apiClient.post as any).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              data: {
                url: 'https://example.com/image.jpg',
              },
            },
          });
        }, 100);
      });
    });

    renderWithProviders(<ImageUploadField onChange={mockOnChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  it('should display image preview after successful upload', async () => {
    const user = userEvent.setup();
    const mockImageUrl = 'https://example.com/image.jpg';

    (apiClient.post as any).mockResolvedValue({
      data: {
        data: {
          url: mockImageUrl,
        },
      },
    });

    renderWithProviders(<ImageUploadField onChange={mockOnChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

    await waitFor(() => {
      const img = screen.getByAltText('Preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockImageUrl);
    });

    expect(mockOnChange).toHaveBeenCalledWith(mockImageUrl);
  });

  it('should allow removing uploaded image', async () => {
    const user = userEvent.setup();
    const mockImageUrl = 'https://example.com/image.jpg';

    renderWithProviders(
      <ImageUploadField onChange={mockOnChange} value={mockImageUrl} />
    );

    // Image should be displayed
    expect(screen.getByAltText('Preview')).toBeInTheDocument();

    // Click remove button
    const removeButton = screen.getByText(/remove image/i);
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
    });

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should display error message and retry button on upload failure', async () => {
    const user = userEvent.setup();

    (apiClient.post as any).mockRejectedValue(new Error('Upload failed'));

    renderWithProviders(<ImageUploadField onChange={mockOnChange} onError={mockOnError} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalled();
  });

  it('should handle retry after upload failure', async () => {
    const user = userEvent.setup();
    const mockImageUrl = 'https://example.com/image.jpg';

    // First call fails, second succeeds
    (apiClient.post as any)
      .mockRejectedValueOnce(new Error('Upload failed'))
      .mockResolvedValueOnce({
        data: {
          data: {
            url: mockImageUrl,
          },
        },
      });

    renderWithProviders(<ImageUploadField onChange={mockOnChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

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

    expect(mockOnChange).toHaveBeenCalledWith(mockImageUrl);
  });

  it('should disable upload during upload in progress', async () => {
    const user = userEvent.setup();

    (apiClient.post as any).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              data: {
                url: 'https://example.com/image.jpg',
              },
            },
          });
        }, 1000);
      });
    });

    renderWithProviders(<ImageUploadField onChange={mockOnChange} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i, { selector: 'input' });

    await user.upload(input, file);

    // Browse button should be disabled during upload
    await waitFor(() => {
      const browseButton = screen.getByText('Browse Files');
      expect(browseButton).toBeDisabled();
    });
  });

  it('should display required indicator when required prop is true', () => {
    renderWithProviders(
      <ImageUploadField onChange={mockOnChange} label="Upload Image" required />
    );

    expect(screen.getByText(/upload image/i)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
