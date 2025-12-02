import { AxiosRequestConfig, AxiosResponse } from 'axios';
declare class HttpClient {
    private client;
    constructor(baseURL: string, timeout?: number);
    private setupInterceptors;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
export declare const ragServiceClient: HttpClient;
export declare const ragService: {
    indexDocument(documentUrl: string, documentId: string, title: string): Promise<any>;
    queryDocuments(question: string, topK?: number): Promise<any>;
    healthCheck(): Promise<any>;
    getIndexingProgress(documentId: string): Promise<any>;
};
export {};
//# sourceMappingURL=httpClient.d.ts.map