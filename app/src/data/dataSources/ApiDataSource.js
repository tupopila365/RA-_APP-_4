import { Result } from '../../domain/Result';
import { NetworkError } from '../../domain/errors';

/**
 * Base API Data Source
 * 
 * Provides common functionality for all API data sources including
 * error handling, request/response transformation, and retry logic.
 */
export class ApiDataSource {
  constructor(baseURL, config = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config,
    };
  }

  async get(endpoint, params = {}, config = {}) {
    const url = this._buildURL(endpoint, params);
    return this._makeRequest('GET', url, null, config);
  }

  async post(endpoint, data = {}, config = {}) {
    const url = this._buildURL(endpoint);
    return this._makeRequest('POST', url, data, config);
  }

  async put(endpoint, data = {}, config = {}) {
    const url = this._buildURL(endpoint);
    return this._makeRequest('PUT', url, data, config);
  }

  async delete(endpoint, config = {}) {
    const url = this._buildURL(endpoint);
    return this._makeRequest('DELETE', url, null, config);
  }

  async _makeRequest(method, url, data, config) {
    const requestConfig = { ...this.defaultConfig, ...config };
    let lastError;

    for (let attempt = 1; attempt <= requestConfig.retries; attempt++) {
      try {
        const result = await this._executeRequest(method, url, data, requestConfig);
        
        if (result.isSuccess()) {
          return result;
        }

        lastError = result.error;

        if (lastError instanceof NetworkError) {
          const shouldRetry = this._shouldRetry(lastError, attempt, requestConfig.retries);
          if (!shouldRetry) {
            break;
          }
        }

        if (attempt < requestConfig.retries) {
          await this._delay(requestConfig.retryDelay * attempt);
        }
      } catch (error) {
        lastError = error;
      }
    }

    return Result.failure(lastError);
  }

  async _executeRequest(method, url, data, config) {
    try {
      const requestOptions = {
        method,
        headers: config.headers,
        signal: this._createAbortSignal(config.timeout),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestOptions);
      
      return this._handleResponse(response, url);
    } catch (error) {
      return this._handleRequestError(error, url);
    }
  }

  async _handleResponse(response, url) {
    try {
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return Result.failure(
          new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            {
              statusCode: response.status,
              url,
              responseData,
            }
          )
        );
      }

      return Result.success(responseData);
    } catch (error) {
      return Result.failure(
        new NetworkError('Failed to parse response', {
          url,
          originalError: error,
        })
      );
    }
  }

  _handleRequestError(error, url) {
    if (error.name === 'AbortError') {
      return Result.failure(
        new NetworkError('Request timeout', {
          url,
          timeout: true,
          originalError: error,
        })
      );
    }

    return Result.failure(
      new NetworkError('Network request failed', {
        url,
        originalError: error,
      })
    );
  }

  _buildURL(endpoint, params = {}) {
    // Ensure baseURL ends with / for proper URL construction
    const base = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
    const url = new URL(endpoint, base);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  _createAbortSignal(timeout) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  _shouldRetry(error, attempt, maxRetries) {
    if (attempt >= maxRetries) {
      return false;
    }

    if (error.isTimeout && error.isTimeout()) {
      return true;
    }

    if (error.isServerError && error.isServerError()) {
      return true;
    }

    if (error.statusCode === 408 || error.statusCode === 429) {
      return true;
    }

    return false;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setDefaultHeaders(headers) {
    this.defaultConfig.headers = {
      ...this.defaultConfig.headers,
      ...headers,
    };
  }

  setAuthToken(token, type = 'Bearer') {
    this.setDefaultHeaders({
      Authorization: `${type} ${token}`,
    });
  }
}
