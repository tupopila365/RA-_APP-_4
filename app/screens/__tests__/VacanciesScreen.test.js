import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import VacanciesScreen from '../VacanciesScreen';
import { vacanciesService } from '../../services/vacanciesService';

// Mock dependencies
jest.mock('../../services/vacanciesService');
jest.mock('../../components', () => ({
  LoadingSpinner: () => 'LoadingSpinner',
  ErrorState: () => 'ErrorState',
}));
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

describe('VacanciesScreen - PDF Download', () => {
  const mockVacancyWithPdf = {
    _id: '1',
    title: 'Software Engineer',
    department: 'IT',
    location: 'Windhoek',
    type: 'full-time',
    closingDate: '2024-12-31',
    description: 'Test description',
    pdfUrl: 'https://example.com/vacancy.pdf',
  };

  const mockVacancyWithoutPdf = {
    _id: '2',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Walvis Bay',
    type: 'full-time',
    closingDate: '2024-12-31',
    description: 'Test description',
  };

  const mockVacancyWithInvalidPdf = {
    _id: '3',
    title: 'Project Manager',
    department: 'Management',
    location: 'Oshakati',
    type: 'full-time',
    closingDate: '2024-12-31',
    description: 'Test description',
    pdfUrl: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    vacanciesService.getVacancies.mockResolvedValue([
      mockVacancyWithPdf,
      mockVacancyWithoutPdf,
      mockVacancyWithInvalidPdf,
    ]);
  });

  describe('Download button rendering', () => {
    it('should display download button when PDF URL exists and is valid', async () => {
      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Software Engineer')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Software Engineer');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeTruthy();
      });
    });

    it('should hide download button when PDF URL is missing', async () => {
      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Data Analyst')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Data Analyst');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeFalsy();
      });
    });

    it('should hide download button when PDF URL is empty string', async () => {
      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Project Manager')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Project Manager');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeFalsy();
      });
    });
  });

  describe('Download action', () => {
    it('should open PDF in device viewer when download button is pressed', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue(true);

      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Software Engineer')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Software Engineer');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Application Form');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com/vacancy.pdf');
        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/vacancy.pdf');
      });
    });

    it('should show loading indicator during download', async () => {
      Linking.canOpenURL.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      Linking.openURL.mockResolvedValue(true);

      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Software Engineer')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Software Engineer');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Application Form');
      fireEvent.press(downloadButton);

      // Check for loading state
      await waitFor(() => {
        expect(screen.queryByText('Opening...')).toBeTruthy();
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when PDF URL cannot be opened', async () => {
      Linking.canOpenURL.mockResolvedValue(false);

      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Software Engineer')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Software Engineer');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Application Form');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Download Failed',
          'Failed to open the application form. Please check your internet connection and try again.'
        );
      });
    });

    it('should display error message when Linking.openURL fails', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockRejectedValue(new Error('Network error'));

      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Software Engineer')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Software Engineer');
      fireEvent.press(vacancyCard);

      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeTruthy();
      });

      // Press download button
      const downloadButton = screen.getByText('Download Application Form');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Download Failed',
          'Failed to open the application form. Please check your internet connection and try again.'
        );
      });
    });

    it('should display error when PDF URL is missing', async () => {
      vacanciesService.getVacancies.mockResolvedValue([mockVacancyWithoutPdf]);

      render(<VacanciesScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Data Analyst')).toBeTruthy();
      });

      // Expand the vacancy card
      const vacancyCard = screen.getByText('Data Analyst');
      fireEvent.press(vacancyCard);

      // Download button should not be present
      await waitFor(() => {
        expect(screen.queryByText('Download Application Form')).toBeFalsy();
      });
    });
  });
});
