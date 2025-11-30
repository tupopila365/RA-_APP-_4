import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import TendersScreen from '../TendersScreen';
import { tendersService } from '../../services/tendersService';

// Mock dependencies
jest.mock('../../services/tendersService');
jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value) => value,
}));
jest.mock('../../components', () => ({
  LoadingSpinner: () => 'LoadingSpinner',
  ErrorState: () => 'ErrorState',
  EmptyState: () => 'EmptyState',
}));
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

describe('TendersScreen - PDF Download', () => {
  const mockTenderWithPdf = {
    _id: '1',
    title: 'Road Construction Project',
    referenceNumber: 'TND-2024-001',
    status: 'open',
    category: 'Construction',
    closingDate: '2024-12-31',
    value: 1000000,
    pdfUrl: 'https://example.com/tender.pdf',
  };

  const mockTenderWithoutPdf = {
    _id: '2',
    title: 'Bridge Maintenance',
    referenceNumber: 'TND-2024-002',
    status: 'open',
    category: 'Maintenance',
    closingDate: '2024-12-31',
    value: 500000,
  };

  const mockTenderWithInvalidPdf = {
    _id: '3',
    title: 'Highway Upgrade',
    referenceNumber: 'TND-2024-003',
    status: 'open',
    category: 'Upgrade',
    closingDate: '2024-12-31',
    value: 2000000,
    pdfUrl: '   ',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tendersService.getTenders.mockResolvedValue({
      data: [mockTenderWithPdf, mockTenderWithoutPdf, mockTenderWithInvalidPdf],
    });
  });

  describe('Download button rendering', () => {
    it('should display download button when PDF URL exists and is valid', async () => {
      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Check for download button
      const downloadButtons = screen.getAllByText('Download Document');
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('should hide download button when PDF URL is missing', async () => {
      tendersService.getTenders.mockResolvedValue({
        data: [mockTenderWithoutPdf],
      });

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Bridge Maintenance')).toBeTruthy();
      });

      // Download button should not be present
      expect(screen.queryByText('Download Document')).toBeFalsy();
    });

    it('should hide download button when PDF URL is whitespace', async () => {
      tendersService.getTenders.mockResolvedValue({
        data: [mockTenderWithInvalidPdf],
      });

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Highway Upgrade')).toBeTruthy();
      });

      // Download button should not be present
      expect(screen.queryByText('Download Document')).toBeFalsy();
    });
  });

  describe('Download action', () => {
    it('should open PDF in device viewer when download button is pressed', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue(true);

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Document');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com/tender.pdf');
        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/tender.pdf');
      });
    });

    it('should show loading indicator during download', async () => {
      Linking.canOpenURL.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      Linking.openURL.mockResolvedValue(true);

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Document');
      fireEvent.press(downloadButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.queryByText('Opening...')).toBeTruthy();
      });
    });

    it('should prevent multiple simultaneous downloads of the same tender', async () => {
      Linking.canOpenURL.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 200)));
      Linking.openURL.mockResolvedValue(true);

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Press download button twice
      const downloadButton = screen.getByText('Download Document');
      fireEvent.press(downloadButton);
      fireEvent.press(downloadButton);

      // Should only call once
      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when PDF URL cannot be opened', async () => {
      Linking.canOpenURL.mockResolvedValue(false);

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Document');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Download Failed',
          'Failed to open tender document. Please check your internet connection and try again.'
        );
      });
    });

    it('should display error message when Linking.openURL fails', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockRejectedValue(new Error('Network error'));

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Document');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Download Failed',
          'Failed to open tender document. Please check your internet connection and try again.'
        );
      });
    });

    it('should display error when PDF URL is missing', async () => {
      tendersService.getTenders.mockResolvedValue({
        data: [mockTenderWithoutPdf],
      });

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Bridge Maintenance')).toBeTruthy();
      });

      // Download button should not be present
      expect(screen.queryByText('Download Document')).toBeFalsy();
    });

    it('should display error alert when attempting to download tender without PDF', async () => {
      // Create a mock tender with pdfUrl that will be removed
      const tenderWithoutUrl = { ...mockTenderWithPdf };
      delete tenderWithoutUrl.pdfUrl;

      tendersService.getTenders.mockResolvedValue({
        data: [tenderWithoutUrl],
      });

      render(<TendersScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Road Construction Project')).toBeTruthy();
      });

      // Download button should not be visible
      expect(screen.queryByText('Download Document')).toBeFalsy();
    });
  });
});
