import { useState, useEffect, useCallback, useRef } from 'react';
import { documentDownloadService } from '../services/documentDownloadService';

/**
 * Custom hook for managing document downloads with progress tracking
 * 
 * @returns {Object} Download state and control functions
 */
const useDocumentDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [downloadedUri, setDownloadedUri] = useState(null);
  
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Progress callback for download updates
   */
  const handleProgress = useCallback((progressData) => {
    if (isMountedRef.current) {
      setProgress(progressData.progress);
    }
  }, []);

  /**
   * Start a download with the given URL and filename
   * 
   * @param {string} url - The URL to download from
   * @param {string} title - The title to use for generating the filename
   * @returns {Promise<{success: boolean, uri?: string, error?: string}>}
   */
  const startDownload = useCallback(async (url, title) => {
    // Reset state
    if (isMountedRef.current) {
      setIsDownloading(true);
      setProgress(0);
      setError(null);
      setDownloadedUri(null);
    }

    try {
      // Generate a safe filename from the title
      const filename = documentDownloadService.generateSafeFilename(title, 'pdf');

      // Start the download with progress tracking
      const result = await documentDownloadService.downloadFile(
        url,
        filename,
        handleProgress
      );

      if (isMountedRef.current) {
        if (result.success) {
          setDownloadedUri(result.uri);
          setProgress(100);
          setIsDownloading(false);
          return { success: true, uri: result.uri };
        } else {
          setError(result.error || 'Download failed');
          setIsDownloading(false);
          setProgress(0);
          return { success: false, error: result.error };
        }
      }

      return result;
    } catch (err) {
      console.error('Download error in hook:', err);
      
      if (isMountedRef.current) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        setIsDownloading(false);
        setProgress(0);
      }

      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  }, [handleProgress]);

  /**
   * Reset the download state (useful for retry)
   */
  const resetDownload = useCallback(() => {
    if (isMountedRef.current) {
      setIsDownloading(false);
      setProgress(0);
      setError(null);
      setDownloadedUri(null);
    }
  }, []);

  return {
    isDownloading,
    progress,
    error,
    downloadedUri,
    startDownload,
    resetDownload,
  };
};

export default useDocumentDownload;
