import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform, Alert } from 'react-native';

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
  return `${Paths.document}${filename}`;
};

/**
 * Check if a file exists at the given filename
 * Uses modern File API to avoid deprecation warnings
 * 
 * @param {string} filename - The filename to check
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
const fileExists = async (filename) => {
  try {
    const fileUri = getFilePath(filename);
    const file = File.fromUri(fileUri);
    return await file.existsAsync();
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
    // Use legacy API for compatibility
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
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

    // Use legacy API for compatibility
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
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
 * Download a file using stable FileSystem.createDownloadResumable() method
 * Uses the proven, working FileSystem API for reliable downloads
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

    // Use stable FileSystem API for file path
    const fileUri = FileSystem.documentDirectory + filename;
    console.log('File will be saved to:', fileUri);

    // Use stable FileSystem.createDownloadResumable() method
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      onProgress
        ? (downloadProgress) => {
            const progress =
              downloadProgress.totalBytesExpectedToWrite > 0
                ? Math.round(
                    (downloadProgress.totalBytesWritten /
                      downloadProgress.totalBytesExpectedToWrite) *
                      100
                  )
                : 0;
            
            // Call the onProgress callback with the expected format
            onProgress({
              totalBytesWritten: downloadProgress.totalBytesWritten,
              totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite,
              progress,
            });
          }
        : undefined
    );

    // Download the file
    const { uri } = await downloadResumable.downloadAsync();

    if (!uri) {
      throw new Error('Download completed but no file URI was returned');
    }

    console.log('File downloaded successfully at:', uri);

    return {
      success: true,
      uri,
    };
  } catch (error) {
    console.error('Download error:', error.message || error);

    // Note: We do NOT delete files as per requirements
    // Partial downloads will remain but can be overwritten on retry

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
 * Uses platform-specific approaches to ensure the file opens properly
 * - Android: Uses IntentLauncher to open with appropriate app
 * - iOS: Uses Linking or WebBrowser
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

    console.log('Attempting to open file:', fileUri);

    // First, check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    console.log('File exists, size:', fileInfo.size);

    // Platform-specific handling
    if (Platform.OS === 'android') {
      // Android: Use Sharing to show "Open with" dialog that lets user choose PDF viewer app
      try {
        console.log('Opening PDF with Sharing on Android to show app chooser...');
        
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (!isAvailable) {
          return {
            success: false,
            error: 'File opening is not available on this device',
          };
        }

        // Use sharing to show the "Open with" dialog - this will display all apps
        // that can open PDFs, allowing the user to choose which one to use
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Open PDF with...',
        });
        
        console.log('PDF opened successfully with Sharing (showing app chooser)');
        return {
          success: true,
        };
      } catch (sharingError) {
        console.error('Sharing failed:', sharingError.message);
        
        // Fallback to IntentLauncher if sharing fails
        try {
          console.log('Falling back to IntentLauncher on Android...');
          
          // Get the content URI for the file
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          console.log('Content URI:', contentUri);
          
          // Launch intent to open PDF
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/pdf',
          });
          
          console.log('PDF opened successfully with IntentLauncher');
          return {
            success: true,
          };
        } catch (intentError) {
          console.error('IntentLauncher also failed:', intentError.message);
          
          // If no PDF viewer is installed, provide helpful error
          if (intentError.message.includes('No Activity found') || 
              intentError.message.includes('ActivityNotFoundException')) {
            return {
              success: false,
              error: 'No PDF viewer app found. Please install a PDF reader app from the Play Store.',
            };
          }
          
          return {
            success: false,
            error: sharingError.message || intentError.message || 'Failed to open PDF',
          };
        }
      }
    } else {
      // iOS: Try multiple methods
      
      // Method 1: Try using Linking.openURL (works well on iOS)
      try {
        console.log('Trying Linking.openURL on iOS...');
        const canOpen = await Linking.canOpenURL(fileUri);
        console.log('Can open with Linking:', canOpen);
        
        if (canOpen) {
          await Linking.openURL(fileUri);
          console.log('File opened successfully with Linking.openURL');
          return {
            success: true,
          };
        }
      } catch (linkingError) {
        console.log('Linking.openURL failed:', linkingError.message);
      }

      // Method 2: Try using WebBrowser to open the file
      try {
        console.log('Trying WebBrowser.openBrowserAsync on iOS...');
        const result = await WebBrowser.openBrowserAsync(fileUri, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          showTitle: true,
          toolbarColor: '#00B4E6',
          controlsColor: '#FFFFFF',
        });
        
        if (result.type !== 'cancel') {
          console.log('File opened successfully with WebBrowser');
          return {
            success: true,
          };
        }
      } catch (webBrowserError) {
        console.log('WebBrowser.openBrowserAsync failed:', webBrowserError.message);
      }

      // Method 3: Use expo-sharing as fallback for iOS
      console.log('Trying Sharing.shareAsync as fallback on iOS...');
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        return {
          success: false,
          error: 'File opening is not available on this device',
        };
      }

      // Use sharing to open the file - this will show a dialog with apps
      // that can open PDFs, and the user can select one to open the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Open PDF with...',
        UTI: 'com.adobe.pdf', // iOS Universal Type Identifier for PDF
      });

      console.log('File opened successfully with Sharing.shareAsync');
      return {
        success: true,
      };
    }
  } catch (error) {
    console.error('Error opening file:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to open file. Please ensure you have a PDF viewer app installed.',
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
