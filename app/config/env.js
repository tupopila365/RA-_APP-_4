/**
 * Environment Configuration
 * 
 * This file manages environment-specific configuration for the mobile app.
 * 
 * For development:
 * - Update API_BASE_URL to point to your local backend
 * - Use your computer's IP address when testing on physical devices
 * - Use localhost for emulators/simulators
 * 
 * For production:
 * - Update API_BASE_URL to your production API endpoint
 */

// Default configuration
const ENV = {
  development: {
    // Using your computer's WiFi IP address
    API_BASE_URL: 'http://192.168.11.52:5000/api',
    API_TIMEOUT: 10000,
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 10000,
    DEBUG_MODE: false,
  },
};

// Determine current environment
const getEnvVars = () => {
  // You can use __DEV__ to detect development mode in React Native
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
