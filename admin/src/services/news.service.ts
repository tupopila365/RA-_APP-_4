import apiClient from './api';

export interface News {
  _id: string;
  id?: string; // Backend sends 'id', but we'll use _id
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string | undefined;
  published: boolean;
}

export interface NewsListResponse {
  success: boolean;
  data: {
    news: News[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NewsResponse {
  success: boolean;
  data: News;
}

/**
 * Fetch paginated news list with optional search and filter
 */
export const getNewsList = async (params?: {
  page?: number;
  limit?: number;
  search?: string | undefined;
  category?: string | undefined;
  published?: boolean | undefined;
}): Promise<NewsListResponse> => {
  const response = await apiClient.get<any>('/news', { params });
  
  // Backend sends 'id' but frontend expects '_id', so we need to map it
  const transformedData = {
    ...response.data,
    data: {
      ...response.data.data,
      news: response.data.data.news.map((item: any) => ({
        ...item,
        _id: item.id || item._id, // Use 'id' from backend, fallback to '_id'
      })),
    },
  };
  
  return transformedData;
};

/**
 * Get single news article by ID
 */
export const getNewsById = async (id: string): Promise<NewsResponse> => {
  const response = await apiClient.get<any>(`/news/${id}`);
  
  // Backend sends 'id' but frontend expects '_id', so we need to map it
  // Backend response structure: { success: true, data: { news: {...} } }
  const newsData = response.data.data?.news || response.data.data;
  
  const transformedData = {
    ...response.data,
    data: {
      ...newsData,
      _id: newsData.id || newsData._id,
    },
  };
  
  return transformedData;
};

/**
 * Create new news article
 */
export const createNews = async (data: NewsFormData): Promise<NewsResponse> => {
  const response = await apiClient.post<NewsResponse>('/news', data);
  return response.data;
};

/**
 * Update existing news article
 */
export const updateNews = async (id: string, data: NewsFormData): Promise<NewsResponse> => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('News ID is required for update');
  }
  
  const cleanId = id.trim();
  
  if (cleanId.length !== 24) {
    throw new Error('Invalid news ID format');
  }
  
  const response = await apiClient.put<any>(`/news/${cleanId}`, data);
  
  // Transform response to ensure _id is present
  const newsData = response.data.data?.news || response.data.data;
  
  return {
    ...response.data,
    data: {
      ...newsData,
      _id: newsData.id || newsData._id,
    },
  };
};

/**
 * Delete news article
 */
export const deleteNews = async (id: string): Promise<{ success: boolean }> => {
  // Validate ID before making request
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('News ID is required for deletion');
  }
  
  // Ensure ID is properly formatted (trim whitespace)
  const cleanId = id.trim();
  
  if (cleanId.length !== 24) {
    throw new Error('Invalid news ID format');
  }
  
  const response = await apiClient.delete<{ success: boolean }>(`/news/${cleanId}`);
  return response.data;
};

/**
 * Upload image for news article
 */
export const uploadNewsImage = async (file: File): Promise<{ success: boolean; data: { imageUrl: string } }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<{ success: boolean; data: { imageUrl: string } }>(
    '/news/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
