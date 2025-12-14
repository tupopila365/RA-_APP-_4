import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

// Error messages for different failure scenarios
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection lost. Please check your internet and try again.',
  INVALID_URL: 'The document URL is invalid or inaccessible.',
  STORAGE_FULL: 'Insufficient storage space. Please free up space and try again.',
  PERMISSION_DENIED: 'File access permission denied. Please check app permissions.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
  FILE_NOT_FOUND: 'The document could not be found.',
};

/**
 * Generate a safe filename from a title and extension
 * Removes special characters and ensures the filename is safe for file systems
 * 
 * @param {string} title - The title to convert to a filename
 * @param {string} extension - The file extension (e.g., 'pdf')
 * @returns {string} A sanitized filename
 */
const generateSafeFilename = (title, extension = 'pdf') => {
  if (!title || typeof title !== 'string') {
    return `document_${Date.now()}.${extension}`;
  }

  // Remove or replace special characters
  // Keep alphanumeric, spaces, hyphens, and underscores
  let safeName = title
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // Limit filename length to 100 characters (excluding extension)
  if (safeName.length > 100) {
    safeName = safeName.substring(0, 100);
  }

  // If the sanitization resulted in an empty string, use a default
  if (!safeName) {
    safeName = `document_${Date.now()}`;
  }

  // Ensure extension doesn't have a leading dot and add it
  const cleanExtension = extension.replace(/^\./, '');
  return `${safeName}.${cleanExtension}`;
};

/**
 * Get the full file path for a given filename
 * 
 * @param {string} filename - The filename
 * @returns {string} The full file path
 */
const getFilePath = (filename) => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename provided');
  }
  return `${FileSystem.documentDirectory}${filename}`;
};

/**
 * Check if a file exists at the given filename
 * 
 * @param {string} filename - The filename to check
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
const fileExists = async (filename) => {
  try {
    const fileUri = getFilePath(filename);
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Delete a file with the given filename
 * 
 * @param {string} filename - The filename to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deleteFile = async (filename) => {
  try {
    const fileUri = getFilePath(filename);
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
      console.log('File deleted successfully:', filename);
      return true;
    }
    console.log('File does not exist:', filename);
    return false;
  } catch (error) {
    console.error('Error deleting file:', error.message || error);
    return false;
  }
};

/**
 * Delete a file using its URI
 * 
 * @param {string} fileUri - The URI of the file to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deleteFileByUri = async (fileUri) => {
  try {
    if (!fileUri || typeof fileUri !== 'string') {
      console.error('Invalid file URI provided:', fileUri);
      return false;
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
      console.log('File deleted successfully:', fileUri);
      return true;
    }
    console.log('File does not exist:', fileUri);
    return false;
  } catch (error) {
    console.error('Error deleting file by URI:', error.message || error);
    return false;
  }
};

/**
 * Download a file using Expo FileSystem.downloadAsync with progress tracking
 * 
 * @param {string} url - The URL to download from
 * @param {string} filename - The filename to save as
 * @param {Function} onProgress - Callback function for progress updates
 * @returns {Promise<{success: boolean, uri?: string, error?: string}>}
 */
const downloadFile = async (url, filename, onProgress) => {
  try {
    // Validate inputs
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error('Invalid URL provided:', url);
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_URL,
      };
    }

    if (!filename || typeof filename !== 'string') {
      console.error('Invalid filename provided:', filename);
      return {
        success: false,
        error: ERROR_MESSAGES.DOWNLOAD_FAILED,
      };
    }

    console.log('Starting download from:', url);
    console.log('Saving to filename:', filename);

    // Get the full file path
    const fileUri = getFilePath(filename);
    console.log('File will be saved to:', fileUri);

    // Create a download resumable for progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        if (onProgress && typeof onProgress === 'function') {
          const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
          const progress = totalBytesExpectedToWrite > 0
            ? Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100)
            : 0;
          
          onProgress({
            totalBytesWritten,
            totalBytesExpectedToWrite,
            progress,
          });
        }
      }
    );

    // Download the file
    const result = await downloadResumable.downloadAsync();

    if (!result || !result.uri) {
      throw new Error('Download completed but no file URI was returned');
    }

    console.log('File downloaded successfully at:', result.uri);

    return {
      success: true,
      uri: result.uri,
    };
  } catch (error) {
    console.error('Download error:', error.message || error);

    // Attempt to clean up partial download
    try {
      if (filename) {
        await deleteFile(filename);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Determine error type and return appropriate message
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('Network') || errorMsg.includes('network') || errorMsg.includes('connection')) {
      return {
        success: false,
        error: ERROR_MESSAGES.NETWORK_ERROR,
      };
    } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
      return {
        success: false,
        error: ERROR_MESSAGES.FILE_NOT_FOUND,
      };
    } else if (errorMsg.includes('body is null') || errorMsg.includes('invalid') || errorMsg.includes('inaccessible')) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_URL,
      };
    } else if (errorMsg.includes('storage') || errorMsg.includes('space')) {
      return {
        success: false,
        error: ERROR_MESSAGES.STORAGE_FULL,
      };
    } else if (errorMsg.includes('permission')) {
      return {
        success: false,
        error: ERROR_MESSAGES.PERMISSION_DENIED,
      };
    } else {
      return {
        success: false,
        error: `${ERROR_MESSAGES.DOWNLOAD_FAILED} (${errorMsg})`,
      };
    }
  }
};

/**
 * Open a file in the device's default viewer
 * 
 * @param {string} fileUri - The URI of the file to open
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const openFile = async (fileUri) => {
  try {
    if (!fileUri || typeof fileUri !== 'string') {
      return {
        success: false,
        error: 'Invalid file URI',
      };
    }

    const canOpen = await Linking.canOpenURL(fileUri);
    
    if (canOpen) {
      await Linking.openURL(fileUri);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: 'Cannot open this file type',
      };
    }
  } catch (error) {
    console.error('Error opening file:', error);
    return {
      success: false,
      error: 'Failed to open file',
    };
  }
};

/**
 * Share a file using the native share sheet
 * 
 * @param {string} fileUri - The URI of the file to share
 * @param {string} filename - The filename (for display purposes)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const shareFile = async (fileUri, filename) => {
  try {
    if (!fileUri || typeof fileUri !== 'string') {
      return {
        success: false,
        error: 'Invalid file URI',
      };
    }

    // Check if sharing is available on this device
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${filename || 'document'}`,
      UTI: 'com.adobe.pdf', // iOS Universal Type Identifier for PDF
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sharing file:', error);
    return {
      success: false,
      error: 'Failed to share file',
    };
  }
};

export const documentDownloadService = {
  downloadFile,
  generateSafeFilename,
  openFile,
  shareFile,
  fileExists,
  getFilePath,
  deleteFile,
  deleteFileByUri,
  ERROR_MESSAGES,
};
