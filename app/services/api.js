import ENV from '../config/env';
import { authService } from './authService';

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
    const { method = 'GET', body, headers = {}, timeout, skipAuth = false, retryCount = 0, maxRetries = 2 } = options;
    
    // Use custom timeout if provided, otherwise use default
    const requestTimeout = timeout || DEFAULT_TIMEOUT;

    // Add auth token if available and not skipped
    const requestHeaders = { ...headers };
    if (!skipAuth) {
      try {
        const accessToken = await authService.getAccessToken();
        if (accessToken) {
          requestHeaders.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.warn('Error getting access token:', error);
      }
    }

    // Log API configuration for debugging
    if (__DEV__) {
      console.log('🌐 API Configuration:', {
        API_BASE_URL,
        endpoint,
        fullUrl: `${API_BASE_URL}${endpoint}`,
        timeout: requestTimeout,
        method,
        hasAuth: !!requestHeaders.Authorization,
        retryAttempt: retryCount,
      });
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
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

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth) {
        try {
          // Attempt to refresh token
          const newAccessToken = await authService.refreshToken();
          if (newAccessToken) {
            // Retry the original request with new token
            requestHeaders.Authorization = `Bearer ${newAccessToken}`;
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), requestTimeout);
            
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
              signal: retryController.signal,
            });
            
            clearTimeout(retryTimeoutId);
            
            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({}));
              throw new ApiError(
                error.message || `HTTP ${retryResponse.status}`,
                retryResponse.status,
                error
              );
            }
            
            const data = await retryResponse.json();
            if (__DEV__) {
              console.log('📦 API Data received (after refresh):', data?.success ? 'Success' : 'Data received');
            }
            return data;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // If refresh fails, clear tokens and throw error
          await authService.logout();
          throw new ApiError('Session expired. Please login again.', 401, { requiresLogin: true });
        }
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
        
        // Retry on timeout if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          const nextRetry = retryCount + 1;
          if (__DEV__) {
            console.log(`🔄 Retrying request (attempt ${nextRetry}/${maxRetries})...`);
          }
          
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (nextRetry)));
          
          // Retry the request
          return this.request(endpoint, {
            ...options,
            retryCount: nextRetry,
          });
        }
        
        throw new ApiError(`Request timeout after ${requestTimeout / 1000}s`, 408, { 
          timeout: true, 
          timeoutMs: requestTimeout,
          retries: retryCount,
        });
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
          retryCount,
        });
      }

      // Retry on network errors (not authentication errors) if we haven't exceeded max retries
      if (
        (error.message.includes('Network request failed') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('NetworkError')) &&
        retryCount < maxRetries
      ) {
        const nextRetry = retryCount + 1;
        if (__DEV__) {
          console.log(`🔄 Retrying request due to network error (attempt ${nextRetry}/${maxRetries})...`);
        }
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (nextRetry)));
        
        // Retry the request
        return this.request(endpoint, {
          ...options,
          retryCount: nextRetry,
        });
      }

      throw new ApiError(error.message || 'Network error', 0, { 
        ...error,
        retries: retryCount,
      });
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

  /**
   * Check if backend server is reachable
   * @param {number} timeoutMs - Timeout in milliseconds (default: 5000)
   * @returns {Promise<{success: boolean, message: string, url: string}>}
   */
  static async checkConnection(timeoutMs = 5000) {
    // Health endpoint is at root level, not under /api
    // API_BASE_URL includes /api, so we need to remove it for health check
    const baseUrl = API_BASE_URL.replace('/api', '');
    const healthEndpoint = '/health';
    const fullUrl = `${baseUrl}${healthEndpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          message: data.message || 'Backend server is reachable',
          url: fullUrl,
        };
      } else {
        return {
          success: false,
          message: `Backend responded with status ${response.status}`,
          url: fullUrl,
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: `Connection timeout after ${timeoutMs / 1000}s. Server may be unreachable.`,
          url: fullUrl,
        };
      }
      
      return {
        success: false,
        message: `Network error: ${error.message}`,
        url: fullUrl,
      };
    }
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
};
