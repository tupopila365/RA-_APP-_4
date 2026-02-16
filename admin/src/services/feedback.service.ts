import apiClient from './api';

export interface FeedbackItem {
  id: number;
  category: string;
  message: string;
  email: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  data: {
    feedback: FeedbackItem[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface FeedbackDetailResponse {
  success: boolean;
  data: {
    feedback: FeedbackItem;
  };
}

export const getFeedbackList = async (
  params?: FeedbackListParams
): Promise<FeedbackListResponse> => {
  const response = await apiClient.get<FeedbackListResponse>('/feedback', {
    params,
  });
  return response.data;
};

export const getFeedbackById = async (
  id: number
): Promise<FeedbackDetailResponse> => {
  const response = await apiClient.get<FeedbackDetailResponse>(`/feedback/${id}`);
  return response.data;
};

export const updateFeedback = async (
  id: number,
  data: { status?: string; adminNotes?: string }
): Promise<FeedbackDetailResponse> => {
  const response = await apiClient.patch<FeedbackDetailResponse>(
    `/feedback/${id}`,
    data
  );
  return response.data;
};
