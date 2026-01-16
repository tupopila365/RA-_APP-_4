"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragService = exports.ragServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const errors_1 = require("../constants/errors");
class HttpClient {
    constructor(baseURL, timeout = 30000) {
        this.client = axios_1.default.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            logger_1.logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('HTTP Request Error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            logger_1.logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            if (error.response) {
                logger_1.logger.error('HTTP Response Error:', {
                    status: error.response.status,
                    data: error.response.data,
                    url: error.config?.url,
                });
            }
            else if (error.request) {
                logger_1.logger.error('HTTP No Response:', {
                    url: error.config?.url,
                    message: error.message,
                });
            }
            else {
                logger_1.logger.error('HTTP Error:', error.message);
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        return this.client.get(url, config);
    }
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
    async put(url, data, config) {
        return this.client.put(url, data, config);
    }
    async delete(url, config) {
        return this.client.delete(url, config);
    }
    async patch(url, data, config) {
        return this.client.patch(url, data, config);
    }
}
// RAG Service HTTP Client with extended timeout for document processing
// Document indexing with embeddings can take 2-5 minutes for large PDFs
exports.ragServiceClient = new HttpClient(env_1.env.RAG_SERVICE_URL, 60000); // 60 seconds
// RAG Service API methods
exports.ragService = {
    async indexDocument(documentUrl, documentId, title) {
        try {
            const response = await exports.ragServiceClient.post('/api/index', {
                document_url: documentUrl,
                document_id: documentId,
                title,
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('RAG indexing failed:', error);
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
                    }
                    else {
                        errorMessage = responseData.detail;
                    }
                }
                else {
                    errorDetails = responseData;
                }
            }
            throw {
                statusCode: error.response?.status || 503,
                code: errors_1.ERROR_CODES.RAG_INDEXING_FAILED,
                message: errorMessage,
                details: errorDetails,
            };
        }
    },
    async queryDocuments(question, topK = 5) {
        try {
            logger_1.logger.debug('Calling RAG service query endpoint', {
                url: `${env_1.env.RAG_SERVICE_URL}/api/query`,
                question: question.substring(0, 100),
                topK,
            });
            const response = await exports.ragServiceClient.post('/api/query', {
                question,
                top_k: topK,
            });
            logger_1.logger.debug('RAG service response received', {
                status: response.status,
                hasData: !!response.data,
                hasAnswer: !!response.data?.answer,
                hasSources: !!response.data?.sources,
                sourcesType: Array.isArray(response.data?.sources) ? 'array' : typeof response.data?.sources,
                sourcesLength: Array.isArray(response.data?.sources) ? response.data.sources.length : 0,
                rawResponse: JSON.stringify(response.data).substring(0, 500),
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('RAG query failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
            });
            throw {
                statusCode: 503,
                code: errors_1.ERROR_CODES.RAG_QUERY_FAILED,
                message: 'Failed to query RAG service',
                details: error.response?.data || error.message,
            };
        }
    },
    async healthCheck() {
        try {
            const response = await exports.ragServiceClient.get('/health');
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('RAG health check failed:', error);
            throw {
                statusCode: 503,
                code: errors_1.ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
                message: 'RAG service is unavailable',
                details: error.message,
            };
        }
    },
    async getIndexingProgress(documentId) {
        try {
            const response = await exports.ragServiceClient.get(`/api/index/progress/${documentId}`);
            return response.data.data;
        }
        catch (error) {
            logger_1.logger.error('RAG progress check failed:', error);
            throw {
                statusCode: 503,
                code: errors_1.ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
                message: 'Failed to get indexing progress',
                details: error.message,
            };
        }
    },
};
//# sourceMappingURL=httpClient.js.map