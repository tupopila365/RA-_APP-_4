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
export declare const configureGoogleDrive: () => boolean;
/**
 * Check if Google Drive is configured
 */
export declare const isGoogleDriveConfigured: () => boolean;
/**
 * Get authenticated Google Drive client
 */
export declare const getGoogleDriveClient: () => import("googleapis").drive_v3.Drive;
/**
 * Upload file to Google Drive
 */
export declare const uploadToGoogleDrive: (fileBuffer: Buffer, fileName: string, mimeType: string, folderId?: string) => Promise<GoogleDriveUploadResult>;
/**
 * Delete file from Google Drive
 */
export declare const deleteFromGoogleDrive: (fileId: string) => Promise<void>;
/**
 * Convert Google Drive sharing link to direct download link
 */
export declare const convertToDirectDownloadLink: (sharingLink: string) => string;
/**
 * Extract file ID from Google Drive URL
 */
export declare const extractFileId: (url: string) => string | null;
//# sourceMappingURL=google-drive.d.ts.map