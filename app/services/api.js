import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;
const DEFAULT_TIMEOUT = ENV.API_TIMEOUT || 15000; // Default 15 seconds

// Enhanced logging function
const logApiCall = (method, endpoint, error = null) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  if (error) {
    console.error('❌ API Error:', {
      method,
      url: fullUrl,
      error: error.message,
      errorType: error.name,
      errorDetails: error,
    });
  } else {
    console.log('🚀 API Call:', method, fullUrl);
  }
};

export class ApiClient {
  static async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, timeout } = options;
    
    // Use custom timeout if provided, otherwise use default
    const requestTimeout = timeout || DEFAULT_TIMEOUT;

    // Log API configuration for debugging
    if (__DEV__) {
      console.log('🌐 API Configuration:', {
        API_BASE_URL,
        endpoint,
        fullUrl: `${API_BASE_URL}${endpoint}`,
        timeout: requestTimeout,
        method,
      });
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
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

      if (__DEV__) {
        console.log('✅ API Response:', response.status, response.statusText);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }

      const data = await response.json();
      if (__DEV__) {
        console.log('📦 API Data received:', data?.success ? 'Success' : 'Data received');
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        if (__DEV__) {
          console.error('⏱️ Request timeout after', requestTimeout, 'ms');
        }
        throw new ApiError(`Request timeout after ${requestTimeout / 1000}s`, 408, { timeout: true, timeoutMs: requestTimeout });
      }

      // Enhanced error logging
      logApiCall(method, endpoint, error);
      
      if (__DEV__) {
        console.error('💥 Network Error Details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          cause: error.cause,
          fullUrl: `${API_BASE_URL}${endpoint}`,
        });
      }

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

  static delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Make a request with custom timeout
   * @param {string} endpoint - API endpoint
   * @param {number} timeoutMs - Timeout in milliseconds
   * @param {object} options - Additional options
   */
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
  VACANCIES: '/vacancies',
  VACANCIES_DETAIL: (id) => `/vacancies/${id}`,
  TENDERS: '/tenders',
  TENDERS_DETAIL: (id) => `/tenders/${id}`,
  BANNERS: '/banners',
  BANNERS_DETAIL: (id) => `/banners/${id}`,
  LOCATIONS: '/locations',
  LOCATIONS_DETAIL: (id) => `/locations/${id}`,
  FAQS: '/faqs',
  FAQS_DETAIL: (id) => `/faqs/${id}`,
  CHATBOT_QUERY: '/chatbot/query',
  CHATBOT_HEALTH: '/chatbot/health',
  CHATBOT_FEEDBACK: (id) => `/chatbot/interactions/${id}/feedback`,
  PROCUREMENT_LEGISLATION: '/procurement-legislation',
  PROCUREMENT_LEGISLATION_DETAIL: (id) => `/procurement-legislation/${id}`,
  PROCUREMENT_PLAN: '/procurement-plan',
  PROCUREMENT_PLAN_DETAIL: (id) => `/procurement-plan/${id}`,
  PROCUREMENT_AWARDS: '/procurement-awards',
  PROCUREMENT_AWARDS_DETAIL: (id) => `/procurement-awards/${id}`,
  PROCUREMENT_OPENING_REGISTER: '/procurement-opening-register',
  PROCUREMENT_OPENING_REGISTER_DETAIL: (id) => `/procurement-opening-register/${id}`,
};
