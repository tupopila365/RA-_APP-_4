const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper module resolution
config.resolver = {
  ...config.resolver,
  // Prevent absolute Windows paths from being included
  sourceExts: [...(config.resolver?.sourceExts || []), 'js', 'jsx', 'ts', 'tsx', 'json'],
  // Ensure node_modules resolution works correctly
  nodeModulesPaths: [
    ...(config.resolver?.nodeModulesPaths || []),
  ],
};

// Watch folders configuration
config.watchFolders = [__dirname];

// Transformer configuration
config.transformer = {
  ...config.transformer,
  // Ensure proper path handling
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;






