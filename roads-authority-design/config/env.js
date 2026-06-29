/**
 * Environment configuration for Roads Authority design app.
 * This build is offline-first: mock data and mock auth are used by default
 * so the APK works without a backend connection.
 *
 * Set USE_MOCK_DATA / USE_MOCK_AUTH to false and point API_BASE_URL at a
 * running backend when you want to test live API integration.
 */

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    DEBUG_MODE: true,
    USE_MOCK_DATA: true,
    USE_MOCK_AUTH: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    DEBUG_MODE: false,
    USE_MOCK_DATA: true,
    USE_MOCK_AUTH: true,
  },
};

const getEnvVars = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
