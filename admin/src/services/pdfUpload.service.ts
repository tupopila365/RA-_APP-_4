import apiClient from './api';

/**
 * Result of PDF upload
 */
export interface PDFUploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

/**
 * PDF Upload Service
 * Handles PDF uploads to backend/Cloudinary with progress tracking
 */
class PDFUploadService {
  /**
   * Validate PDF file before upload
   */
  validatePDF(file: File): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return {
        valid: false,
        error: 'No file selected',
      };
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF files are allowed',
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    return { valid: true };
  }

  /**
   * Upload PDF to backend with progress tracking
   * @param file - PDF file to upload
   * @param onProgress - Callback function to track upload progress (0-100)
   * @param retryCount - Number of retry attempts (default: 0)
   * @returns Upload result with PDF URL and metadata
   */
  async uploadPDF(
    file: File,
    onProgress?: (progress: number) => void,
    retryCount: number = 0
  ): Promise<PDFUploadResult> {
    const MAX_RETRIES = 3;
    const UPLOAD_TIMEOUT = 60000; // 60 seconds

    // Validate file before upload
    const validation = this.validatePDF(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to backend with progress tracking and timeout
      const response = await apiClient.post<{
        success: boolean;
        data: PDFUploadResult;
      }>('/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data.data;
    } catch (error: any) {
      // Handle timeout errors with retry
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        if (retryCount < MAX_RETRIES) {
          console.log(`Upload timeout. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          // Exponential backoff: wait 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.uploadPDF(file, onProgress, retryCount + 1);
        }
        throw new Error('Upload timeout. Please try again later.');
      }

      // Handle network errors with retry
      if (!error.response && retryCount < MAX_RETRIES) {
        console.log(`Network error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.uploadPDF(file, onProgress, retryCount + 1);
      }

      // Handle server errors
      if (error.response) {
        const errorMessage = error.response.data?.error?.message 
          || error.response.data?.message 
          || 'Upload failed. Please try again.';
        throw new Error(errorMessage);
      }

      // Handle network errors (no retry left)
      if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }

      throw new Error('An unexpected error occurred during upload.');
    }
  }

  /**
   * Delete PDF from backend
   * @param publicId - Cloudinary public ID of the PDF to delete
   */
  async deletePDF(publicId: string): Promise<void> {
    try {
      await apiClient.delete('/upload/pdf', {
        data: { publicId },
      });
    } catch (error: any) {
      console.error('Failed to delete PDF:', error);
      throw new Error('Failed to delete PDF');
    }
  }
}

// Export singleton instance
export const pdfUploadService = new PDFUploadService();

export default pdfUploadService;
