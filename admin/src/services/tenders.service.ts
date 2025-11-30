import apiClient from './api';

export interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: 'open' | 'closed' | 'upcoming';
  openingDate: string;
  closingDate: string;
  pdfUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenderFormData {
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: 'open' | 'closed' | 'upcoming';
  openingDate: string;
  closingDate: string;
  pdfUrl: string;
  published: boolean;
}

export interface TenderListResponse {
  success: boolean;
  data: {
    tenders: Tender[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface TenderResponse {
  success: boolean;
  data: {
    tender: Tender;
  };
}

/**
 * Fetch paginated tenders list with optional search and filter
 */
export const getTendersList = async (params?: {
  page?: number;
  limit?: number;
  search?: string | undefined;
  status?: string | undefined;
  published?: boolean | undefined;
}): Promise<TenderListResponse> => {
  const response = await apiClient.get<TenderListResponse>('/tenders', { params });
  return response.data;
};

/**
 * Get single tender by ID
 */
export const getTenderById = async (id: string): Promise<TenderResponse> => {
  const response = await apiClient.get<TenderResponse>(`/tenders/${id}`);
  return response.data;
};

/**
 * Create new tender
 */
export const createTender = async (data: TenderFormData): Promise<TenderResponse> => {
  const response = await apiClient.post<TenderResponse>('/tenders', data);
  return response.data;
};

/**
 * Update existing tender
 */
export const updateTender = async (id: string, data: TenderFormData): Promise<TenderResponse> => {
  const response = await apiClient.put<TenderResponse>(`/tenders/${id}`, data);
  return response.data;
};

/**
 * Delete tender
 */
export const deleteTender = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/tenders/${id}`);
  return response.data;
};

/**
 * Upload PDF for tender
 * Note: This uses a generic upload endpoint. In production, you may want to use
 * a dedicated file upload service like Cloudinary or AWS S3.
 */
export const uploadTenderPDF = async (file: File): Promise<{ success: boolean; data: { pdfUrl: string } }> => {
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
