// Extend Jest matchers
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules that cause issues with Jest
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
    fromModule: jest.fn(() => ({ uri: 'mocked-asset' })),
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => {
  const mockFile = {
    existsAsync: jest.fn(() => Promise.resolve(false)),
    deleteAsync: jest.fn(() => Promise.resolve()),
    downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file://mock-download.pdf' })),
  };

  return {
    __esModule: true,
    default: {},
    downloadAsync: jest.fn(),
    getInfoAsync: jest.fn(), // Keep for backward compatibility
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    moveAsync: jest.fn(),
    copyAsync: jest.fn(),
    createDownloadResumable: jest.fn(() => ({
      downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file://mock-download.pdf' })),
    })),
    documentDirectory: 'file://mock-document-directory/',
    cacheDirectory: 'file://mock-cache-directory/',
    // New File API
    File: {
      fromUri: jest.fn((uri) => ({
        ...mockFile,
        uri,
        existsAsync: jest.fn(() => Promise.resolve(false)),
        deleteAsync: jest.fn(() => Promise.resolve()),
      })),
    },
    Paths: {
      document: 'file://mock-document-directory/',
      cache: 'file://mock-cache-directory/',
    },
  };
});

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  createURL: jest.fn((path) => `exp://mock-app/${path}`),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock ActivityIndicator to avoid ES6 module issues
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ size, color, testID, accessible, accessibilityLabel, accessibilityRole }) =>
      React.createElement('ActivityIndicator', {
        size,
        color,
        testID,
        accessible,
        accessibilityLabel,
        accessibilityRole,
      }),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Provider: ({ children }) => children,
  DefaultTheme: {},
}));

// Silence console warnings in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock global fetch if needed
global.fetch = jest.fn();

// Setup for React Native
jest.useFakeTimers();
