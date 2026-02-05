import apiClient from './api';

export type RAServiceCategory =
  | 'Licensing'
  | 'Vehicle Registration'
  | 'Permits & Authorisations'
  | 'Other';

export interface RAServicePdf {
  title: string;
  url: string;
  fileName: string;
}

export interface RAService {
  id: number;
  name: string;
  description: string;
  requirements: string[];
  fee: string;
  ageRestriction?: string | null;
  category: RAServiceCategory;
  imageUrl?: string | null;
  pdfs: RAServicePdf[];
  contactInfo?: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const RASERVICE_CATEGORIES: RAServiceCategory[] = [
  'Licensing',
  'Vehicle Registration',
  'Permits & Authorisations',
  'Other',
];

export const raServicesService = {
  list: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/ra-services', { params });
    return response.data;
  },

  get: async (id: string | number) => {
    const response = await apiClient.get(`/ra-services/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description: string;
    requirements: string[];
    fee: string;
    ageRestriction?: string;
    category: RAServiceCategory;
    imageUrl?: string;
    pdfs: RAServicePdf[];
    contactInfo?: string;
    published?: boolean;
    sortOrder?: number;
  }) => {
    const response = await apiClient.post('/ra-services', data);
    return response.data;
  },

  update: async (id: string | number, data: Partial<RAService>) => {
    const response = await apiClient.put(`/ra-services/${id}`, data);
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await apiClient.delete(`/ra-services/${id}`);
    return response.data;
  },
};
