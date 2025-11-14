const API_BASE_URL = 'https://api.roadsauthority.na/api';
const TIMEOUT = 10000;

export class ApiClient {
  static async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, { timeout: true });
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
  FAQS: '/faqs',
  OFFICES: '/offices',
};
