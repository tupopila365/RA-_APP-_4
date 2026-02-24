/**
 * Environment configuration for Roads Authority design app.
 * Points to the same backend as the main app and admin panel.
 *
 * Backend: run from repo root: cd backend && npm run dev (default port 5000)
 * Admin: run from repo root: cd admin && npm run dev
 *
 * For physical device: use your machine's IP instead of localhost, e.g. http://192.168.1.x:5000/api
 */

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    DEBUG_MODE: false,
  },
};

const getEnvVars = () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
