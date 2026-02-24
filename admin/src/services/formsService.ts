import apiClient from './api';

/** Single form/download as shown in app and admin (same structure). */
export interface FormDownload {
  id: number;
  title: string;
  description: string;
  category: string;
  pdfUrl: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const FORM_CATEGORIES = [
  'Permits',
  'Procurement',
  'Reports',
  'Manuals',
  'Plans',
  'Legislation',
] as const;

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
    title: string;
    description?: string;
    category: string;
    pdfUrl: string;
    published?: boolean;
  }) => {
    const response = await apiClient.post('/forms', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FormDownload>) => {
    const response = await apiClient.put(`/forms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/forms/${id}`);
    return response.data;
  },
};
