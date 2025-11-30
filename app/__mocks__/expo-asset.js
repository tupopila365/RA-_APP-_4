// Mock for expo-asset module
module.exports = {
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
    fromModule: jest.fn(() => ({ uri: 'mocked-asset-uri' })),
  },
};
