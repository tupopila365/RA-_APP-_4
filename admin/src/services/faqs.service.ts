import apiClient from './api';

export interface FAQ {
  _id: string;
  id?: string; // Backend sends 'id', but we'll use _id
  question: string;
  answer: string;
  category?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface FAQListResponse {
  success: boolean;
  data: {
    faqs: FAQ[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface FAQResponse {
  success: boolean;
  data: {
    faq: FAQ;
  };
}

/**
 * Fetch paginated FAQs list with optional search and filter
 */
export const getFAQsList = async (params?: {
  page?: number;
  limit?: number;
  search?: string | undefined;
  category?: string | undefined;
}): Promise<FAQListResponse> => {
  const response = await apiClient.get<any>('/faqs', { params });
  
  // Backend sends 'id' but frontend expects '_id', so we need to map it
  const transformedData = {
    ...response.data,
    data: {
      ...response.data.data,
      faqs: response.data.data.faqs.map((item: any) => ({
        ...item,
        _id: item.id || item._id, // Use 'id' from backend, fallback to '_id'
      })),
      pagination: response.data.data.pagination,
    },
  };
  
  return transformedData;
};

/**
 * Get single FAQ by ID
 */
export const getFAQById = async (id: string): Promise<FAQResponse> => {
  const response = await apiClient.get<any>(`/faqs/${id}`);
  
  // Backend sends 'id' but frontend expects '_id', so we need to map it
  // Backend response structure: { success: true, data: { faq: {...} } }
  const faqData = response.data.data?.faq || response.data.data;
  
  const transformedData = {
    ...response.data,
    data: {
      faq: {
        ...faqData,
        _id: faqData.id || faqData._id,
      },
    },
  };
  
  return transformedData;
};

/**
 * Create new FAQ
 */
export const createFAQ = async (data: FAQFormData): Promise<FAQResponse> => {
  const response = await apiClient.post<FAQResponse>('/faqs', data);
  return response.data;
};

/**
 * Update existing FAQ
 */
export const updateFAQ = async (id: string, data: FAQFormData): Promise<FAQResponse> => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('FAQ ID is required for update');
  }
  
  const cleanId = id.trim();
  
  if (cleanId.length !== 24) {
    throw new Error('Invalid FAQ ID format');
  }
  
  const response = await apiClient.put<any>(`/faqs/${cleanId}`, data);
  
  // Transform response to ensure _id is present
  const faqData = response.data.data?.faq || response.data.data;
  
  return {
    ...response.data,
    data: {
      faq: {
        ...faqData,
        _id: faqData.id || faqData._id,
      },
    },
  };
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (id: string): Promise<{ success: boolean }> => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('FAQ ID is required for deletion');
  }
  
  // Ensure ID is properly formatted (trim whitespace)
  const cleanId = id.trim();
  
  if (cleanId.length !== 24) {
    throw new Error('Invalid FAQ ID format');
  }
  
  const response = await apiClient.delete<{ success: boolean }>(`/faqs/${cleanId}`);
  return response.data;
};

