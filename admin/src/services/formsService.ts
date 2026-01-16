import apiClient from './api';

export interface FormDocument {
  title: string;
  url: string;
  fileName: string;
}

export interface Form {
  id: string;
  name: string;
  category: 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy';
  documents: FormDocument[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const formsService = {
  list: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/forms', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/forms/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    category: string;
    documents: FormDocument[];
    published?: boolean;
  }) => {
    const response = await apiClient.post('/forms', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Form>) => {
    const response = await apiClient.put(`/forms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/forms/${id}`);
    return response.data;
  },

  // Get forms for mobile app (published only)
  getPublished: async (params?: { category?: string }) => {
    const response = await apiClient.get('/forms', { 
      params: { ...params, published: true } 
    });
    return response.data;
  },
};
