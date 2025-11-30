import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { documentDownloadService } from '../documentDownloadService';

// Mock the modules
jest.mock('expo-file-system');
jest.mock('expo-sharing');
jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
  },
}));

describe('DocumentDownloadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSafeFilename', () => {
    it('should generate a safe filename from a normal title', () => {
      const filename = documentDownloadService.generateSafeFilename('Road Construction Project', 'pdf');
      expect(filename).toBe('Road_Construction_Project.pdf');
    });

    it('should remove special characters', () => {
      const filename = documentDownloadService.generateSafeFilename('Project@2024!#$%', 'pdf');
      expect(filename).toMatch(/^[a-zA-Z0-9\-_.]+$/);
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should replace spaces with underscores', () => {
      const filename = documentDownloadService.generateSafeFilename('My Document Title', 'pdf');
      expect(filename).toBe('My_Document_Title.pdf');
      expect(filename).not.toMatch(/\s/);
    });

    it('should handle empty string input', () => {
      const filename = documentDownloadService.generateSafeFilename('', 'pdf');
      expect(filename).toMatch(/^document_\d+\.pdf$/);
    });

    it('should handle null input', () => {
      const filename = documentDownloadService.generateSafeFilename(null, 'pdf');
      expect(filename).toMatch(/^document_\d+\.pdf$/);
    });

    it('should handle undefined input', () => {
      const filename = documentDownloadService.generateSafeFilename(undefined, 'pdf');
      expect(filename).toMatch(/^document_\d+\.pdf$/);
    });

    it('should limit filename length to 100 characters plus extension', () => {
      const longTitle = 'a'.repeat(200);
      const filename = documentDownloadService.generateSafeFilename(longTitle, 'pdf');
      expect(filename.length).toBeLessThanOrEqual(104); // 100 + '.pdf'
    });

    it('should preserve the file extension', () => {
      const filename = documentDownloadService.generateSafeFilename('Document', 'pdf');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should handle different extensions', () => {
      const filename1 = documentDownloadService.generateSafeFilename('Document', 'doc');
      expect(filename1).toMatch(/\.doc$/);

      const filename2 = documentDownloadService.generateSafeFilename('Document', 'txt');
      expect(filename2).toMatch(/\.txt$/);
    });

    it('should remove consecutive underscores', () => {
      const filename = documentDownloadService.generateSafeFilename('Document   With   Spaces', 'pdf');
      expect(filename).not.toMatch(/__/);
    });

    it('should not start or end with underscores', () => {
      const filename = documentDownloadService.generateSafeFilename('  Document  ', 'pdf');
      const baseName = filename.replace(/\.pdf$/, '');
      expect(baseName).not.toMatch(/^_/);
      expect(baseName).not.toMatch(/_$/);
    });
  });

  describe('getFilePath', () => {
    it('should construct full file path', () => {
      const filename = 'test.pdf';
      const filePath = documentDownloadService.getFilePath(filename);
      expect(filePath).toBe(`${FileSystem.documentDirectory}${filename}`);
    });

    it('should throw error for invalid filename', () => {
      expect(() => documentDownloadService.getFilePath(null)).toThrow('Invalid filename provided');
      expect(() => documentDownloadService.getFilePath('')).toThrow('Invalid filename provided');
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true });

      const exists = await documentDownloadService.fileExists('test.pdf');
      expect(exists).toBe(true);
      expect(FileSystem.getInfoAsync).toHaveBeenCalled();
    });

    it('should return false if file does not exist', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });

      const exists = await documentDownloadService.fileExists('test.pdf');
      expect(exists).toBe(false);
    });

    it('should return false on error', async () => {
      FileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

      const exists = await documentDownloadService.fileExists('test.pdf');
      expect(exists).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete file if it exists', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      FileSystem.deleteAsync.mockResolvedValue();

      const result = await documentDownloadService.deleteFile('test.pdf');
      expect(result).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });

    it('should return false if file does not exist', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });

      const result = await documentDownloadService.deleteFile('test.pdf');
      expect(result).toBe(false);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      FileSystem.deleteAsync.mockRejectedValue(new Error('Delete failed'));

      const result = await documentDownloadService.deleteFile('test.pdf');
      expect(result).toBe(false);
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockDownloadResumable = {
        downloadAsync: jest.fn().mockResolvedValue({ uri: 'file://test.pdf' }),
      };
      FileSystem.createDownloadResumable.mockReturnValue(mockDownloadResumable);

      const result = await documentDownloadService.downloadFile(
        'https://example.com/test.pdf',
        'test.pdf',
        jest.fn()
      );

      expect(result.success).toBe(true);
      expect(result.uri).toBe('file://test.pdf');
      expect(FileSystem.createDownloadResumable).toHaveBeenCalled();
    });

    it('should return error for invalid URL', async () => {
      const result = await documentDownloadService.downloadFile(null, 'test.pdf', jest.fn());

      expect(result.success).toBe(false);
      expect(result.error).toBe(documentDownloadService.ERROR_MESSAGES.INVALID_URL);
    });

    it('should return error for invalid filename', async () => {
      const result = await documentDownloadService.downloadFile('https://example.com/test.pdf', null, jest.fn());

      expect(result.success).toBe(false);
      expect(result.error).toBe(documentDownloadService.ERROR_MESSAGES.DOWNLOAD_FAILED);
    });

    it('should call progress callback during download', async () => {
      const progressCallback = jest.fn();
      const mockDownloadResumable = {
        downloadAsync: jest.fn().mockImplementation(async () => {
          // Simulate progress callback
          const progressHandler = FileSystem.createDownloadResumable.mock.calls[0][3];
          progressHandler({
            totalBytesWritten: 50,
            totalBytesExpectedToWrite: 100,
          });
          return { uri: 'file://test.pdf' };
        }),
      };
      FileSystem.createDownloadResumable.mockReturnValue(mockDownloadResumable);

      await documentDownloadService.downloadFile(
        'https://example.com/test.pdf',
        'test.pdf',
        progressCallback
      );

      expect(progressCallback).toHaveBeenCalledWith({
        totalBytesWritten: 50,
        totalBytesExpectedToWrite: 100,
        progress: 50,
      });
    });

    it('should handle download failure', async () => {
      const mockDownloadResumable = {
        downloadAsync: jest.fn().mockRejectedValue(new Error('Download failed')),
      };
      FileSystem.createDownloadResumable.mockReturnValue(mockDownloadResumable);
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });

      const result = await documentDownloadService.downloadFile(
        'https://example.com/test.pdf',
        'test.pdf',
        jest.fn()
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(documentDownloadService.ERROR_MESSAGES.DOWNLOAD_FAILED);
    });

    it('should handle network error', async () => {
      const mockDownloadResumable = {
        downloadAsync: jest.fn().mockRejectedValue(new Error('Network request failed')),
      };
      FileSystem.createDownloadResumable.mockReturnValue(mockDownloadResumable);
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });

      const result = await documentDownloadService.downloadFile(
        'https://example.com/test.pdf',
        'test.pdf',
        jest.fn()
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(documentDownloadService.ERROR_MESSAGES.NETWORK_ERROR);
    });
  });

  describe('openFile', () => {
    it('should open file successfully', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue();

      const result = await documentDownloadService.openFile('file://test.pdf');

      expect(result.success).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('file://test.pdf');
      expect(Linking.openURL).toHaveBeenCalledWith('file://test.pdf');
    });

    it('should return error for invalid URI', async () => {
      const result = await documentDownloadService.openFile(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file URI');
    });

    it('should return error if file cannot be opened', async () => {
      Linking.canOpenURL.mockResolvedValue(false);

      const result = await documentDownloadService.openFile('file://test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot open this file type');
    });

    it('should handle opening error', async () => {
      Linking.canOpenURL.mockRejectedValue(new Error('Open failed'));

      const result = await documentDownloadService.openFile('file://test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to open file');
    });
  });

  describe('shareFile', () => {
    it('should share file successfully', async () => {
      Sharing.isAvailableAsync.mockResolvedValue(true);
      Sharing.shareAsync.mockResolvedValue();

      const result = await documentDownloadService.shareFile('file://test.pdf', 'test.pdf');

      expect(result.success).toBe(true);
      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith('file://test.pdf', {
        mimeType: 'application/pdf',
        dialogTitle: 'Share test.pdf',
        UTI: 'com.adobe.pdf',
      });
    });

    it('should return error for invalid URI', async () => {
      const result = await documentDownloadService.shareFile(null, 'test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file URI');
    });

    it('should return error if sharing is not available', async () => {
      Sharing.isAvailableAsync.mockResolvedValue(false);

      const result = await documentDownloadService.shareFile('file://test.pdf', 'test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sharing is not available on this device');
    });

    it('should handle sharing error', async () => {
      Sharing.isAvailableAsync.mockResolvedValue(true);
      Sharing.shareAsync.mockRejectedValue(new Error('Share failed'));

      const result = await documentDownloadService.shareFile('file://test.pdf', 'test.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to share file');
    });
  });
});
