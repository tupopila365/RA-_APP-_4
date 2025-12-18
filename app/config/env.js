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
    // USB Connection: Use localhost (requires: adb reverse tcp:5000 tcp:5000)
    // WiFi Connection: Use your computer's network IP address
    // To switch: Run 'adb reverse tcp:5000 tcp:5000' for USB, then use localhost
    // For WiFi: Use your IP from 'ipconfig' (e.g., 192.168.12.166)
    API_BASE_URL: 'http://localhost:5000/api', // USB connection (bypasses firewall)
    // API_BASE_URL: 'http://192.168.12.166:5000/api', // WiFi connection
    // Different timeouts for different types of requests
    API_TIMEOUT: 15000, // 15 seconds for regular API calls (news, banners, etc.)
    API_TIMEOUT_LONG: 60000, // 60 seconds for chatbot queries
    API_TIMEOUT_STREAM: 120000, // 2 minutes for streaming responses
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    // Different timeouts for different types of requests
    API_TIMEOUT: 15000, // 15 seconds for regular API calls
    API_TIMEOUT_LONG: 60000, // 60 seconds for chatbot queries
    API_TIMEOUT_STREAM: 120000, // 2 minutes for streaming responses
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
