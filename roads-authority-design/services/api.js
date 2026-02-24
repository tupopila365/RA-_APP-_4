import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;
const DEFAULT_TIMEOUT = ENV.API_TIMEOUT || 15000;

const logApiCall = (method, endpoint, error = null) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  if (error) {
    console.error('API Error:', { method, url: fullUrl, error: error?.message });
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('API Call:', method, fullUrl);
  }
};

export class ApiClient {
  static async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, timeout } = options;
    const requestTimeout = timeout || DEFAULT_TIMEOUT;

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      delete config.headers['Content-Type'];
      config.body = body;
    }

    try {
      logApiCall(method, endpoint);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMessage, response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${requestTimeout / 1000}s`, 408, {
          timeout: true,
          timeoutMs: requestTimeout,
        });
      }
      logApiCall(method, endpoint, error);
      throw new ApiError(error.message || 'Network error', 0, error);
    }
  }

  static get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  static put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  static patch(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  static delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  static requestWithTimeout(endpoint, timeoutMs, options = {}) {
    return this.request(endpoint, { ...options, timeout: timeoutMs });
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const API_ENDPOINTS = {
  NEWS: '/news',
  NEWS_DETAIL: (id) => `/news/${id}`,
  FAQS: '/faqs',
  CHATBOT_QUERY: '/chatbot/query',
  CHATBOT_HEALTH: '/chatbot/health',
  FEEDBACK: '/feedback',
  POTHOLE_REPORTS: '/pothole-reports',
  POTHOLE_MY_REPORTS: '/pothole-reports/my-reports',
  ROADWORKS: '/roadworks',
  ROAD_STATUS: '/road-status',
  PLN_APPLICATIONS: '/pln/applications',
  APP_USERS_LOGIN: '/app-users/login',
  APP_USERS_REGISTER: '/app-users/register',
  APP_USERS_ME: '/app-users/me',
  APP_USERS_LOGOUT: '/app-users/logout',
  APP_USERS_REFRESH: '/app-users/refresh',
  FORMS: '/forms',
};
