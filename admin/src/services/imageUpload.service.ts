import axios, { AxiosProgressEvent } from 'axios';
import { errorLogger } from './errorLogger.service';

/**
 * Cloudinary upload configuration
 */
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] || 'dmsgvrkp5',
  uploadPreset: import.meta.env['VITE_CLOUDINARY_UPLOAD_PRESET'] || 'roads_authority_admin',
  folder: 'roads-authority',
  // Image optimization transformations
  transformations: {
    // Limit maximum dimensions while maintaining aspect ratio
    maxWidth: 1200,
    maxHeight: 800,
    // Quality optimization (auto selects best quality/size balance)
    quality: 'auto',
    // Format optimization (auto selects best format for browser)
    fetchFormat: 'auto',
  },
};

/**
 * Cloudinary upload URL
 */
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

/**
 * Result of image upload
 */
export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Result of file validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Cloudinary API response structure
 */
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

/**
 * Supported image formats
 */
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Image Upload Service
 * Handles image uploads to Cloudinary with progress tracking and validation
 */
class ImageUploadService {
  /**
   * Validate image file before upload
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  validateImage(file: File): ValidationResult {
    // Check if file exists
    if (!file) {
      const error = 'No file selected';
      errorLogger.logValidationFailure(error);
      return {
        valid: false,
        error,
      };
    }

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      const error = `Invalid file type. Supported formats: JPEG, PNG, GIF, WebP`;
      errorLogger.logValidationFailure(error, file);
      return {
        valid: false,
        error,
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      const error = `File size exceeds ${maxSizeMB}MB limit`;
      errorLogger.logValidationFailure(error, file);
      return {
        valid: false,
        error,
      };
    }

    return { valid: true };
  }

  /**
   * Upload image to Cloudinary with progress tracking and optimization
   * @param file - Image file to upload
   * @param onProgress - Callback function to track upload progress (0-100)
   * @returns Upload result with image URL and metadata
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    // Validate file before upload
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create form data for upload
    // Note: Transformations must be configured in the upload preset, not sent with unsigned uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);

    try {
      // Upload to Cloudinary with progress tracking
      const response = await axios.post<CloudinaryUploadResponse>(
        CLOUDINARY_UPLOAD_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );

      // Transform Cloudinary response to our format
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        bytes: response.data.bytes,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          const timeoutError = new Error('Upload timeout. Please try again.');
          errorLogger.logUploadFailure(timeoutError, file, {
            errorCode: error.code,
            cloudinaryUrl: CLOUDINARY_UPLOAD_URL,
          });
          throw timeoutError;
        }
        if (!error.response) {
          const networkError = new Error('Network error. Please check your connection.');
          errorLogger.logNetworkError(networkError, 'image upload', {
            file: file.name,
            fileSize: file.size,
            cloudinaryUrl: CLOUDINARY_UPLOAD_URL,
          });
          throw networkError;
        }
        if (error.response.status === 401) {
          const authError = new Error('Upload authentication failed. Please contact support.');
          errorLogger.logAuthenticationError(authError, 'image upload');
          throw authError;
        }
        const uploadError = new Error(
          error.response.data?.error?.message || 'Upload failed. Please try again.'
        );
        errorLogger.logUploadFailure(uploadError, file, {
          status: error.response.status,
          statusText: error.response.statusText,
          responseData: error.response.data,
        });
        throw uploadError;
      }
      const unexpectedError = error instanceof Error ? error : new Error('An unexpected error occurred during upload.');
      errorLogger.logUploadFailure(unexpectedError, file, {
        errorType: 'unexpected',
      });
      throw unexpectedError;
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param publicId - Cloudinary public ID
   * @param options - Transformation options
   * @returns Optimized image URL
   */
  getOptimizedImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    }
  ): string {
    const {
      width = CLOUDINARY_CONFIG.transformations.maxWidth,
      height = CLOUDINARY_CONFIG.transformations.maxHeight,
      quality = CLOUDINARY_CONFIG.transformations.quality,
      format = CLOUDINARY_CONFIG.transformations.fetchFormat,
      crop = 'limit',
    } = options || {};

    const transformations = `c_${crop},w_${width},h_${height}/q_${quality}/f_${format}`;
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Generate thumbnail URL for list views
   * @param publicId - Cloudinary public ID
   * @param size - Thumbnail size (small: 100px, medium: 200px, large: 400px)
   * @returns Thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const dimensions = {
      small: 100,
      medium: 200,
      large: 400,
    };

    const dimension = dimensions[size];
    return this.getOptimizedImageUrl(publicId, {
      width: dimension,
      height: dimension,
      crop: 'fill',
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    // Note: Deletion requires server-side implementation with API secret
    // This is a placeholder for future implementation
    console.warn('Image deletion should be handled server-side:', publicId);
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();

export default imageUploadService;
