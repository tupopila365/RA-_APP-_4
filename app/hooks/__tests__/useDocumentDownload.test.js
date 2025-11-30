import { renderHook, act, waitFor } from '@testing-library/react-native';
import useDocumentDownload from '../useDocumentDownload';
import { documentDownloadService } from '../../services/documentDownloadService';

// Mock the document download service
jest.mock('../../services/documentDownloadService');

describe('useDocumentDownload Hook', () => {
  let hookResult;

  beforeEach(() => {
    jest.clearAllMocks();
    hookResult = null;
  });

  afterEach(() => {
    // Cleanup any rendered hooks
    if (hookResult && hookResult.unmount) {
      hookResult.unmount();
    }
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.downloadedUri).toBe(null);
      expect(typeof result.current.startDownload).toBe('function');
      expect(typeof result.current.resetDownload).toBe('function');
    });
  });

  describe('State Management During Download', () => {
    it('should update state correctly during successful download', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';
      const mockFilename = 'Test_Document.pdf';
      const mockUri = 'file:///path/to/Test_Document.pdf';

      documentDownloadService.generateSafeFilename.mockReturnValue(mockFilename);
      documentDownloadService.downloadFile.mockImplementation(async (url, filename, onProgress) => {
        // Simulate progress updates
        onProgress({ progress: 25, totalBytesWritten: 250, totalBytesExpectedToWrite: 1000 });
        onProgress({ progress: 50, totalBytesWritten: 500, totalBytesExpectedToWrite: 1000 });
        onProgress({ progress: 75, totalBytesWritten: 750, totalBytesExpectedToWrite: 1000 });
        onProgress({ progress: 100, totalBytesWritten: 1000, totalBytesExpectedToWrite: 1000 });
        
        return { success: true, uri: mockUri };
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      // Start download
      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      // Verify final state
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(result.current.error).toBe(null);
      expect(result.current.downloadedUri).toBe(mockUri);
    });

    it('should update progress during download', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';

      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockImplementation(async (url, filename, onProgress) => {
        // Simulate progress updates
        onProgress({ progress: 30, totalBytesWritten: 300, totalBytesExpectedToWrite: 1000 });
        onProgress({ progress: 60, totalBytesWritten: 600, totalBytesExpectedToWrite: 1000 });
        onProgress({ progress: 100, totalBytesWritten: 1000, totalBytesExpectedToWrite: 1000 });
        
        return { success: true, uri: 'file:///test.pdf' };
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      // Progress should be 100 at the end
      expect(result.current.progress).toBe(100);
    });
  });

  describe('Error State Handling', () => {
    it('should handle download errors correctly', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';
      const mockError = 'Network connection lost. Please check your internet and try again.';

      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockResolvedValue({
        success: false,
        error: mockError,
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBe(mockError);
      expect(result.current.downloadedUri).toBe(null);
      expect(result.current.progress).toBe(0);
    });

    it('should handle exceptions during download', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';
      const mockErrorMessage = 'Unexpected error occurred';

      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockRejectedValue(new Error(mockErrorMessage));

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBe(mockErrorMessage);
      expect(result.current.downloadedUri).toBe(null);
    });

    it('should reset error state on new download attempt', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';

      // First download fails
      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockResolvedValueOnce({
        success: false,
        error: 'Network error',
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(result.current.error).toBe('Network error');

      // Second download succeeds
      documentDownloadService.downloadFile.mockResolvedValueOnce({
        success: true,
        uri: 'file:///test.pdf',
      });

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.downloadedUri).toBe('file:///test.pdf');
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should not crash when unmounted during download', () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';

      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockImplementation(async () => {
        return { success: true, uri: 'file:///test.pdf' };
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result, unmount } = hookResult;

      // Start download (don't await)
      act(() => {
        result.current.startDownload(mockUrl, mockTitle);
      });

      // Unmount immediately - should not cause errors
      unmount();
      hookResult = null; // Prevent double unmount in afterEach

      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Reset Download', () => {
    it('should reset all state when resetDownload is called', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';

      documentDownloadService.generateSafeFilename.mockReturnValue('test.pdf');
      documentDownloadService.downloadFile.mockResolvedValue({
        success: true,
        uri: 'file:///test.pdf',
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      // Complete a download
      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(result.current.downloadedUri).toBe('file:///test.pdf');
      expect(result.current.progress).toBe(100);

      // Reset download
      act(() => {
        result.current.resetDownload();
      });

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.downloadedUri).toBe(null);
    });
  });

  describe('Service Integration', () => {
    it('should call generateSafeFilename with correct parameters', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';

      documentDownloadService.generateSafeFilename.mockReturnValue('Test_Document.pdf');
      documentDownloadService.downloadFile.mockResolvedValue({
        success: true,
        uri: 'file:///test.pdf',
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(documentDownloadService.generateSafeFilename).toHaveBeenCalledWith(mockTitle, 'pdf');
    });

    it('should call downloadFile with correct parameters', async () => {
      const mockUrl = 'https://example.com/document.pdf';
      const mockTitle = 'Test Document';
      const mockFilename = 'Test_Document.pdf';

      documentDownloadService.generateSafeFilename.mockReturnValue(mockFilename);
      documentDownloadService.downloadFile.mockResolvedValue({
        success: true,
        uri: 'file:///test.pdf',
      });

      hookResult = renderHook(() => useDocumentDownload());
      const { result } = hookResult;

      await act(async () => {
        await result.current.startDownload(mockUrl, mockTitle);
      });

      expect(documentDownloadService.downloadFile).toHaveBeenCalledWith(
        mockUrl,
        mockFilename,
        expect.any(Function)
      );
    });
  });
});
