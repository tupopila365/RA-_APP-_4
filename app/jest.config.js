module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-paper|react-native-safe-area-context|react-native-screens|expo|@expo|expo-font|expo-asset|expo-file-system|expo-linking|expo-notifications|expo-status-bar|@expo/vector-icons)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx',
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'screens/**/*.{js,jsx}',
    'services/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
    '^screens/(.*)$': '<rootDir>/screens/$1',
    '^services/(.*)$': '<rootDir>/services/$1',
    '^hooks/(.*)$': '<rootDir>/hooks/$1',
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^theme/(.*)$': '<rootDir>/theme/$1',
    '^context/(.*)$': '<rootDir>/context/$1',
    '^config/(.*)$': '<rootDir>/config/$1',
    '^assets/(.*)$': '<rootDir>/assets/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
