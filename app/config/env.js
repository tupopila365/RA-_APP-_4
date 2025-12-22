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
    // Connection Options:
    // 1. USB Connection: Use localhost (requires: adb reverse tcp:5000 tcp:5000)
    // 2. WiFi Connection: Use your computer's network IP address
    // 3. Ngrok Tunnel: Use ngrok HTTPS URL (works from any network)
    // 
    // To use ngrok:
    //   1. Run: .\start-backend-with-ngrok.bat
    //   2. Copy the ngrok HTTPS URL (e.g., https://abc123.ngrok-free.app)
    //   3. Update API_BASE_URL below with your ngrok URL
    //   4. Restart Expo app
    
    // USB connection (bypasses firewall)
    // API_BASE_URL: 'http://localhost:5000/api',
    
    // WiFi connection (uncomment and use your IP)
    // API_BASE_URL: 'http://192.168.12.166:5000/api',
    
    // Ngrok tunnel (works from any network!)
    API_BASE_URL: 'https://tuskless-clinkingly-dorothy.ngrok-free.dev/api',
    
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
