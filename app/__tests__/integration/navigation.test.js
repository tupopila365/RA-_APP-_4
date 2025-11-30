import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../../App';

// Mock all the screens
jest.mock('../../screens/SplashScreen', () => 'SplashScreen');
jest.mock('../../screens/HomeScreen', () => 'HomeScreen');
jest.mock('../../screens/NewsScreen', () => 'NewsScreen');
jest.mock('../../screens/NewsDetailScreen', () => 'NewsDetailScreen');
jest.mock('../../screens/VacanciesScreen', () => 'VacanciesScreen');
jest.mock('../../screens/TendersScreen', () => 'TendersScreen');
jest.mock('../../screens/ChatbotScreen', () => 'ChatbotScreen');
jest.mock('../../screens/FAQsScreen', () => 'FAQsScreen');
jest.mock('../../screens/FindOfficesScreen', () => 'FindOfficesScreen');
jest.mock('../../screens/SettingsScreen', () => 'SettingsScreen');
jest.mock('../../screens/MoreMenuScreen', () => 'MoreMenuScreen');

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
}));

describe('Navigation Integration Tests', () => {
  it('renders the app without crashing', () => {
    const { getByTestId } = render(<App />);
    // App should render splash screen initially
    expect(getByTestId).toBeDefined();
  });

  it('shows splash screen initially', () => {
    const { UNSAFE_getByType } = render(<App />);
    // Check if SplashScreen is rendered
    expect(UNSAFE_getByType('SplashScreen')).toBeTruthy();
  });

  it('transitions from splash to main app', async () => {
    jest.useFakeTimers();
    const { UNSAFE_queryByType } = render(<App />);
    
    // Initially shows splash
    expect(UNSAFE_queryByType('SplashScreen')).toBeTruthy();
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      // Splash should be gone
      expect(UNSAFE_queryByType('SplashScreen')).toBeNull();
    });
    
    jest.useRealTimers();
  });
});

describe('Tab Navigation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all tab screens', async () => {
    const { getByText } = render(<App />);
    
    // Skip splash screen
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      // Check if tab bar items are present
      expect(getByText('Home')).toBeTruthy();
      expect(getByText('News')).toBeTruthy();
      expect(getByText('Vacancies')).toBeTruthy();
      expect(getByText('Tenders')).toBeTruthy();
      expect(getByText('More')).toBeTruthy();
    });
  });
});
