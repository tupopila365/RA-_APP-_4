import apiClient from './api';

export type RoadStatusStatus = 'open' | 'caution' | 'maintenance' | 'closed';

export interface RoadStatus {
  _id: string;
  id?: number;
  name: string;
  region: string;
  status: RoadStatusStatus;
  lat: number;
  lng: number;
  notes?: string | null;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListRoadStatusParams {
  page?: number;
  limit?: number;
  region?: string;
  status?: string;
  search?: string;
  published?: boolean;
}

export interface ListRoadStatusResponse {
  success: boolean;
  data: {
    roadworks: RoadStatus[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface RoadStatusResponse {
  success: boolean;
  data: {
    roadwork: RoadStatus;
  };
}

export interface RoadStatusCreateInput {
  name: string;
  region: string;
  status: RoadStatusStatus;
  lat: number;
  lng: number;
  notes?: string | null;
  published?: boolean;
}

export interface RoadStatusUpdateInput {
  name?: string;
  region?: string;
  status?: RoadStatusStatus;
  lat?: number;
  lng?: number;
  notes?: string | null;
  published?: boolean;
}

export const getRoadStatusList = async (params: ListRoadStatusParams = {}): Promise<ListRoadStatusResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.region) queryParams.append('region', params.region);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.published !== undefined) queryParams.append('published', params.published.toString());

  const url = `/road-status?${queryParams.toString()}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getRoadStatusById = async (id: string): Promise<RoadStatusResponse> => {
  const response = await apiClient.get(`/road-status/${id}`);
  return response.data;
};

export const createRoadStatus = async (data: RoadStatusCreateInput): Promise<RoadStatusResponse> => {
  const response = await apiClient.post('/road-status', data);
  return response.data;
};

export const updateRoadStatus = async (
  id: string,
  data: RoadStatusUpdateInput
): Promise<RoadStatusResponse> => {
  const response = await apiClient.put(`/road-status/${id}`, data);
  return response.data;
};

export const deleteRoadStatus = async (id: string): Promise<void> => {
  await apiClient.delete(`/road-status/${id}`);
};

export const publishRoadStatus = async (id: string): Promise<RoadStatusResponse> => {
  const response = await apiClient.put(`/road-status/${id}/publish`);
  return response.data;
};

export const unpublishRoadStatus = async (id: string): Promise<RoadStatusResponse> => {
  const response = await apiClient.put(`/road-status/${id}/unpublish`);
  return response.data;
};

export const getRegions = async (): Promise<{ success: boolean; data: { regions: string[] } }> => {
  const response = await apiClient.get('/road-status/filters/regions');
  return response.data;
};
