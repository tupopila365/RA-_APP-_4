import { google } from 'googleapis';
import { Readable } from 'stream';
import { logger } from '../utils/logger';
import { env } from './env';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export interface GoogleDriveUploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
  directDownloadLink: string;
}

/**
 * Configure Google Drive API client
 */
export const configureGoogleDrive = (): boolean => {
  if (!env.GOOGLE_DRIVE_CLIENT_ID || !env.GOOGLE_DRIVE_CLIENT_SECRET || !env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    logger.warn('Google Drive credentials not provided. Google Drive upload functionality will be disabled.');
    return false;
  }

  logger.info('Google Drive configured successfully');
  return true;
};

/**
 * Check if Google Drive is configured
 */
export const isGoogleDriveConfigured = (): boolean => {
  return !!(env.GOOGLE_DRIVE_CLIENT_ID && env.GOOGLE_DRIVE_CLIENT_SECRET && env.GOOGLE_DRIVE_REFRESH_TOKEN);
};

/**
 * Get authenticated Google Drive client
 */
export const getGoogleDriveClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_DRIVE_CLIENT_ID,
    env.GOOGLE_DRIVE_CLIENT_SECRET,
    env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
  );

  oauth2Client.setCredentials({
    refresh_token: env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

/**
 * Upload file to Google Drive
 */
export const uploadToGoogleDrive = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<GoogleDriveUploadResult> => {
  try {
    const drive = getGoogleDriveClient();

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    // Upload file
    const fileMetadata: any = {
      name: fileName,
      mimeType: mimeType,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    logger.info('Uploading file to Google Drive', { fileName, mimeType, folderId });

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = response.data.id!;

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    logger.info('File uploaded to Google Drive successfully', {
      fileId,
      fileName,
      webViewLink: response.data.webViewLink,
    });

    // Generate direct download link
    const directDownloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return {
      fileId,
      webViewLink: response.data.webViewLink || '',
      webContentLink: response.data.webContentLink || '',
      directDownloadLink,
    };
  } catch (error: any) {
    logger.error('Failed to upload file to Google Drive', {
      error: error.message,
      fileName,
    });
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
};

/**
 * Delete file from Google Drive
 */
export const deleteFromGoogleDrive = async (fileId: string): Promise<void> => {
  try {
    const drive = getGoogleDriveClient();

    logger.info('Deleting file from Google Drive', { fileId });

    await drive.files.delete({
      fileId: fileId,
    });

    logger.info('File deleted from Google Drive successfully', { fileId });
  } catch (error: any) {
    logger.error('Failed to delete file from Google Drive', {
      error: error.message,
      fileId,
    });
    throw new Error(`Failed to delete from Google Drive: ${error.message}`);
  }
};

/**
 * Convert Google Drive sharing link to direct download link
 */
export const convertToDirectDownloadLink = (sharingLink: string): string => {
  // Extract file ID from sharing link
  const fileIdMatch = sharingLink.match(/\/d\/([^/]+)/);
  if (!fileIdMatch) {
    throw new Error('Invalid Google Drive sharing link');
  }

  const fileId = fileIdMatch[1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Extract file ID from Google Drive URL
 */
export const extractFileId = (url: string): string | null => {
  // Match various Google Drive URL formats
  const patterns = [
    /\/d\/([^/]+)/, // /d/FILE_ID
    /id=([^&]+)/, // id=FILE_ID
    /\/file\/d\/([^/]+)/, // /file/d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};
