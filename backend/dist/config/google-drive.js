"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFileId = exports.convertToDirectDownloadLink = exports.deleteFromGoogleDrive = exports.uploadToGoogleDrive = exports.getGoogleDriveClient = exports.isGoogleDriveConfigured = exports.configureGoogleDrive = void 0;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
const logger_1 = require("../utils/logger");
const env_1 = require("./env");
/**
 * Configure Google Drive API client
 */
const configureGoogleDrive = () => {
    if (!env_1.env.GOOGLE_DRIVE_CLIENT_ID || !env_1.env.GOOGLE_DRIVE_CLIENT_SECRET || !env_1.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
        logger_1.logger.warn('Google Drive credentials not provided. Google Drive upload functionality will be disabled.');
        return false;
    }
    logger_1.logger.info('Google Drive configured successfully');
    return true;
};
exports.configureGoogleDrive = configureGoogleDrive;
/**
 * Check if Google Drive is configured
 */
const isGoogleDriveConfigured = () => {
    return !!(env_1.env.GOOGLE_DRIVE_CLIENT_ID && env_1.env.GOOGLE_DRIVE_CLIENT_SECRET && env_1.env.GOOGLE_DRIVE_REFRESH_TOKEN);
};
exports.isGoogleDriveConfigured = isGoogleDriveConfigured;
/**
 * Get authenticated Google Drive client
 */
const getGoogleDriveClient = () => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(env_1.env.GOOGLE_DRIVE_CLIENT_ID, env_1.env.GOOGLE_DRIVE_CLIENT_SECRET, env_1.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback');
    oauth2Client.setCredentials({
        refresh_token: env_1.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });
    return googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
};
exports.getGoogleDriveClient = getGoogleDriveClient;
/**
 * Upload file to Google Drive
 */
const uploadToGoogleDrive = async (fileBuffer, fileName, mimeType, folderId) => {
    try {
        const drive = (0, exports.getGoogleDriveClient)();
        // Convert buffer to readable stream
        const bufferStream = new stream_1.Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);
        // Upload file
        const fileMetadata = {
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
        logger_1.logger.info('Uploading file to Google Drive', { fileName, mimeType, folderId });
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        });
        const fileId = response.data.id;
        // Make file publicly accessible
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        logger_1.logger.info('File uploaded to Google Drive successfully', {
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
    }
    catch (error) {
        logger_1.logger.error('Failed to upload file to Google Drive', {
            error: error.message,
            fileName,
        });
        throw new Error(`Failed to upload to Google Drive: ${error.message}`);
    }
};
exports.uploadToGoogleDrive = uploadToGoogleDrive;
/**
 * Delete file from Google Drive
 */
const deleteFromGoogleDrive = async (fileId) => {
    try {
        const drive = (0, exports.getGoogleDriveClient)();
        logger_1.logger.info('Deleting file from Google Drive', { fileId });
        await drive.files.delete({
            fileId: fileId,
        });
        logger_1.logger.info('File deleted from Google Drive successfully', { fileId });
    }
    catch (error) {
        logger_1.logger.error('Failed to delete file from Google Drive', {
            error: error.message,
            fileId,
        });
        throw new Error(`Failed to delete from Google Drive: ${error.message}`);
    }
};
exports.deleteFromGoogleDrive = deleteFromGoogleDrive;
/**
 * Convert Google Drive sharing link to direct download link
 */
const convertToDirectDownloadLink = (sharingLink) => {
    // Extract file ID from sharing link
    const fileIdMatch = sharingLink.match(/\/d\/([^/]+)/);
    if (!fileIdMatch) {
        throw new Error('Invalid Google Drive sharing link');
    }
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
};
exports.convertToDirectDownloadLink = convertToDirectDownloadLink;
/**
 * Extract file ID from Google Drive URL
 */
const extractFileId = (url) => {
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
exports.extractFileId = extractFileId;
//# sourceMappingURL=google-drive.js.map