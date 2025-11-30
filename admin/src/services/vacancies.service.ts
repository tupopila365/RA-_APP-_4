import apiClient from './api';

export interface Vacancy {
  id: string;
  title: string;
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: string;
  pdfUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VacancyFormData {
  title: string;
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: string;
  pdfUrl?: string;
  published: boolean;
}

export interface VacancyListResponse {
  success: boolean;
  data: {
    vacancies: Vacancy[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface VacancyResponse {
  success: boolean;
  data: {
    vacancy: Vacancy;
  };
}

/**
 * Fetch paginated vacancies list with optional search and filter
 */
export const getVacanciesList = async (params?: {
  page?: number;
  limit?: number;
  search?: string | undefined;
  type?: string | undefined;
  published?: boolean | undefined;
}): Promise<VacancyListResponse> => {
  const response = await apiClient.get<VacancyListResponse>('/vacancies', { params });
  return response.data;
};

/**
 * Get single vacancy by ID
 */
export const getVacancyById = async (id: string): Promise<VacancyResponse> => {
  const response = await apiClient.get<VacancyResponse>(`/vacancies/${id}`);
  return response.data;
};

/**
 * Create new vacancy
 */
export const createVacancy = async (data: VacancyFormData): Promise<VacancyResponse> => {
  const response = await apiClient.post<VacancyResponse>('/vacancies', data);
  return response.data;
};

/**
 * Update existing vacancy
 */
export const updateVacancy = async (id: string, data: VacancyFormData): Promise<VacancyResponse> => {
  const response = await apiClient.put<VacancyResponse>(`/vacancies/${id}`, data);
  return response.data;
};

/**
 * Delete vacancy
 */
export const deleteVacancy = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/vacancies/${id}`);
  return response.data;
};

/**
 * Upload PDF for vacancy
 * Note: This uses a generic upload endpoint. In production, you may want to use
 * a dedicated file upload service like Cloudinary or AWS S3.
 */
export const uploadVacancyPDF = async (file: File): Promise<{ success: boolean; data: { pdfUrl: string } }> => {
  const formData = new FormData();
  formData.append('file', file);

  // Using documents upload endpoint as a temporary solution
  // In production, implement a dedicated file upload service
  const response = await apiClient.post<{ success: boolean; data: { fileUrl: string } }>(
    '/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data.success,
    data: {
      pdfUrl: response.data.data.fileUrl,
    },
  };
};
