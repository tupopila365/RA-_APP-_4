/**
 * Environment Configuration
 * 
 * This file manages environment-specific configuration for the mobile app.
 * 
 * NETWORK TROUBLESHOOTING:
 * If you're getting "Network request failed" errors, try these solutions:
 * 
 * 1. Make sure backend is running:
 *    - Run: QUICK-FIX-NETWORK-ISSUE.bat
 *    - Or manually: cd backend && npm run dev
 * 
 * 2. For USB connection (recommended):
 *    - Run: adb reverse tcp:5001 tcp:5001
 *    - Use: API_BASE_URL: 'http://localhost:5001/api'
 * 
 * 3. For WiFi connection:
 *    - Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
 *    - Use: API_BASE_URL: 'http://YOUR_IP:5001/api'
 * 
 * 4. For external access (works anywhere):
 *    - Run: start-backend-with-ngrok.bat
 *    - Copy the ngrok HTTPS URL
 *    - Use: API_BASE_URL: 'https://your-ngrok-url.ngrok-free.app/api'
 */

// Default configuration
const ENV = {
  development: {
    // CURRENT CONFIGURATION - Update based on your setup:
    
    // Option 1: USB Connection (RECOMMENDED - bypasses firewall)
    // Requires: adb reverse tcp:5000 tcp:5000
    //API_BASE_URL: 'http://192.168.11.52:5000/api',
   API_BASE_URL: 'http://:192.168.0.9:5000/api',
    
    // Option 2: WiFi Connection (if localhost doesn't work)
    // Your backend is running on: http://192.168.108.1:5000
    // API_BASE_URL: 'http://192.168.108.1:5000/api',
    
    // Option 3: Ngrok Tunnel (works from any network)
    // Run: start-backend-with-ngrok.bat
    // Copy the HTTPS URL and update below:
    // API_BASE_URL: 'https://your-ngrok-url.ngrok-free.app/api',
    
    // Timeout Configuration
    API_TIMEOUT: 15000, // 15 seconds for regular API calls (news, banners, etc.)
    API_TIMEOUT_LONG: 60000, // 60 seconds for chatbot queries
    API_TIMEOUT_STREAM: 60000, // 60 seconds for streaming responses
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    API_TIMEOUT_STREAM: 60000,
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
