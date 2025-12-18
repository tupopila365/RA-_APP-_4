import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';
import { logger } from './logger';
import { ERROR_CODES } from '../constants/errors';

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 30000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('HTTP Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error('HTTP Response Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
        } else if (error.request) {
          logger.error('HTTP No Response:', {
            url: error.config?.url,
            message: error.message,
          });
        } else {
          logger.error('HTTP Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }
}

// RAG Service HTTP Client with extended timeout for document processing
// Document indexing with embeddings can take 2-5 minutes for large PDFs
export const ragServiceClient = new HttpClient(env.RAG_SERVICE_URL, 300000); // 5 minutes

// RAG Service API methods
export const ragService = {
  async indexDocument(documentUrl: string, documentId: string, title: string) {
    try {
      const response = await ragServiceClient.post('/api/index', {
        document_url: documentUrl,
        document_id: documentId,
        title,
      });
      return response.data;
    } catch (error: any) {
      logger.error('RAG indexing failed:', error);
      
      // Extract error details from FastAPI error response
      // FastAPI returns errors in { detail: {...} } format
      let errorDetails = error.message;
      let errorMessage = 'Failed to index document in RAG service';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // FastAPI error responses have a 'detail' field
        if (responseData.detail) {
          errorDetails = responseData.detail;
          
          // Extract more specific error message if available
          if (typeof responseData.detail === 'object') {
            errorMessage = responseData.detail.message || errorMessage;
            
            // Include diagnostic information if available
            if (responseData.detail.diagnostics) {
              errorDetails = {
                ...responseData.detail,
                diagnostics: responseData.detail.diagnostics,
              };
            }
          } else {
            errorMessage = responseData.detail;
          }
        } else {
          errorDetails = responseData;
        }
      }
      
      throw {
        statusCode: error.response?.status || 503,
        code: ERROR_CODES.RAG_INDEXING_FAILED,
        message: errorMessage,
        details: errorDetails,
      };
    }
  },

  async queryDocuments(question: string, topK: number = 5) {
    try {
      const response = await ragServiceClient.post('/api/query', {
        question,
        top_k: topK,
      });
      return response.data;
    } catch (error: any) {
      logger.error('RAG query failed:', error);
      throw {
        statusCode: 503,
        code: ERROR_CODES.RAG_QUERY_FAILED,
        message: 'Failed to query RAG service',
        details: error.response?.data || error.message,
      };
    }
  },

  async healthCheck() {
    try {
      const response = await ragServiceClient.get('/health');
      return response.data;
    } catch (error: any) {
      logger.error('RAG health check failed:', error);
      throw {
        statusCode: 503,
        code: ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
        message: 'RAG service is unavailable',
        details: error.message,
      };
    }
  },

  async getIndexingProgress(documentId: string) {
    try {
      const response = await ragServiceClient.get(`/api/index/progress/${documentId}`);
      return response.data.data;
    } catch (error: any) {
      logger.error('RAG progress check failed:', error);
      throw {
        statusCode: 503,
        code: ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
        message: 'Failed to get indexing progress',
        details: error.message,
      };
    }
  },
};
