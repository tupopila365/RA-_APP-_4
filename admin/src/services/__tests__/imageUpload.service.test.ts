import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageUploadService } from '../imageUpload.service';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('ImageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImage', () => {
    it('should validate valid JPEG image', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid PNG image', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should validate valid GIF image', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should validate valid WebP image', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should reject file with invalid type', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject file exceeding size limit', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      const result = imageUploadService.validateImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    it('should reject when no file provided', () => {
      const result = imageUploadService.validateImage(null as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file selected');
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully with progress tracking', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const mockResponse = {
        data: {
          secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
          public_id: 'roads-authority/test',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 1024 * 1024,
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const progressCallback = vi.fn();
      const result = await imageUploadService.uploadImage(file, progressCallback);

      expect(result).toEqual({
        url: mockResponse.data.secure_url,
        publicId: mockResponse.data.public_id,
        width: mockResponse.data.width,
        height: mockResponse.data.height,
        format: mockResponse.data.format,
        bytes: mockResponse.data.bytes,
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('cloudinary.com'),
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: expect.any(Function),
        })
      );
    });

    it('should reject upload for invalid file', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      await expect(imageUploadService.uploadImage(file)).rejects.toThrow('Invalid file type');
    });

    it('should handle network errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: undefined,
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(imageUploadService.uploadImage(file)).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(imageUploadService.uploadImage(file)).rejects.toThrow('Upload timeout');
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('should generate optimized URL with default options', () => {
      const publicId = 'roads-authority/test-image';
      const url = imageUploadService.getOptimizedImageUrl(publicId);

      expect(url).toContain('cloudinary.com');
      expect(url).toContain(publicId);
      expect(url).toContain('c_limit');
      expect(url).toContain('w_1200');
      expect(url).toContain('h_800');
      expect(url).toContain('q_auto');
      expect(url).toContain('f_auto');
    });

    it('should generate optimized URL with custom options', () => {
      const publicId = 'roads-authority/test-image';
      const url = imageUploadService.getOptimizedImageUrl(publicId, {
        width: 600,
        height: 400,
        quality: '80',
        format: 'webp',
        crop: 'fill',
      });

      expect(url).toContain('c_fill');
      expect(url).toContain('w_600');
      expect(url).toContain('h_400');
      expect(url).toContain('q_80');
      expect(url).toContain('f_webp');
    });
  });

  describe('getThumbnailUrl', () => {
    it('should generate small thumbnail URL', () => {
      const publicId = 'roads-authority/test-image';
      const url = imageUploadService.getThumbnailUrl(publicId, 'small');

      expect(url).toContain('w_100');
      expect(url).toContain('h_100');
      expect(url).toContain('c_fill');
    });

    it('should generate medium thumbnail URL by default', () => {
      const publicId = 'roads-authority/test-image';
      const url = imageUploadService.getThumbnailUrl(publicId);

      expect(url).toContain('w_200');
      expect(url).toContain('h_200');
    });

    it('should generate large thumbnail URL', () => {
      const publicId = 'roads-authority/test-image';
      const url = imageUploadService.getThumbnailUrl(publicId, 'large');

      expect(url).toContain('w_400');
      expect(url).toContain('h_400');
    });
  });
});
