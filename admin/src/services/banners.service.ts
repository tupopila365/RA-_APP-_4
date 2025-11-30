import apiClient from './api';

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  title: string;
  description?: string | undefined;
  imageUrl: string;
  linkUrl?: string | undefined;
  order: number;
  active: boolean;
}

export interface BannerListResponse {
  success: boolean;
  data: {
    banners: Banner[];
    total: number;
  };
}

export interface BannerResponse {
  success: boolean;
  data: Banner;
}

/**
 * Fetch all banners
 */
export const getBannersList = async (): Promise<BannerListResponse> => {
  const response = await apiClient.get<BannerListResponse>('/banners');
  return response.data;
};

/**
 * Get single banner by ID
 */
export const getBannerById = async (id: string): Promise<BannerResponse> => {
  const response = await apiClient.get<BannerResponse>(`/banners/${id}`);
  return response.data;
};

/**
 * Create new banner
 */
export const createBanner = async (data: BannerFormData): Promise<BannerResponse> => {
  const response = await apiClient.post<BannerResponse>('/banners', data);
  return response.data;
};

/**
 * Update existing banner
 */
export const updateBanner = async (id: string, data: BannerFormData): Promise<BannerResponse> => {
  const response = await apiClient.put<BannerResponse>(`/banners/${id}`, data);
  return response.data;
};

/**
 * Delete banner
 */
export const deleteBanner = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/banners/${id}`);
  return response.data;
};

/**
 * Update banner order
 */
export const updateBannerOrder = async (banners: Array<{ id: string; order: number }>): Promise<{ success: boolean }> => {
  const response = await apiClient.put<{ success: boolean }>('/banners/reorder', { banners });
  return response.data;
};

/**
 * Upload image for banner
 */
export const uploadBannerImage = async (file: File): Promise<{ success: boolean; data: { imageUrl: string } }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<{ success: boolean; data: { imageUrl: string } }>(
    '/banners/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
