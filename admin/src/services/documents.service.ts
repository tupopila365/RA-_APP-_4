import apiClient from './api';
import { IDocument, IApiResponse, IPaginatedResponse } from '../types';

/**
 * Documents Service
 * Handles all API calls related to PDF document management
 */

export interface IDocumentUploadData {
  title: string;
  description: string;
  category: 'policy' | 'tender' | 'report' | 'other';
  file: File;
}

export interface IDocumentListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  indexed?: boolean;
}

/**
 * Upload a new PDF document with progress tracking
 */
export const uploadDocument = async (
  data: IDocumentUploadData,
  onUploadProgress?: (progressEvent: { loaded: number; total: number; percentage: number }) => void
): Promise<IApiResponse<IDocument>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);
  formData.append('file', data.file);

  const response = await apiClient.post<IApiResponse<IDocument>>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  });

  return response.data;
};

/**
 * Get list of documents with pagination and filtering
 */
export const getDocuments = async (params?: IDocumentListParams): Promise<IPaginatedResponse<IDocument>> => {
  const response = await apiClient.get<IPaginatedResponse<IDocument>>('/documents', {
    params,
  });

  return response.data;
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (id: string): Promise<IApiResponse<IDocument>> => {
  const response = await apiClient.get<IApiResponse<IDocument>>(`/documents/${id}`);
  return response.data;
};

/**
 * Delete a document
 */
export const deleteDocument = async (id: string): Promise<IApiResponse<void>> => {
  const response = await apiClient.delete<IApiResponse<void>>(`/documents/${id}`);
  return response.data;
};

/**
 * Get indexing progress for a document
 */
export const getIndexingProgress = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/documents/${id}/indexing-progress`);
  return response.data;
};

const documentsService = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  getIndexingProgress,
};

export default documentsService;
