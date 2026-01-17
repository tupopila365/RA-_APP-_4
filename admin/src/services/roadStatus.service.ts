import apiClient from './api';

export interface RoadStatus {
  _id: string;
  road: string;
  section?: string;
  area?: string;
  region: string;
  status: 'Open' | 'Ongoing' | 'Ongoing Maintenance' | 'Planned' | 'Planned Works' | 'Closed' | 'Restricted' | 'Completed';
  title: string;
  description?: string;
  startDate?: string;
  expectedCompletion?: string;
  completedAt?: string;
  alternativeRoute?: string; // Legacy field
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  affectedLanes?: string;
  contractor?: string;
  estimatedDuration?: string;
  published: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // New structured alternate routes fields
  roadClosure?: {
    roadCode: string;
    startTown?: string;
    endTown?: string;
    startCoordinates: { latitude: number; longitude: number };
    endCoordinates: { latitude: number; longitude: number };
    polylineCoordinates: Array<{ latitude: number; longitude: number }>;
  };
  alternateRoutes?: Array<{
    routeName: string;
    roadsUsed: string[];
    waypoints: Array<{
      name: string;
      coordinates: { latitude: number; longitude: number };
    }>;
    vehicleType: string[];
    distanceKm: number;
    estimatedTime: string;
    polylineCoordinates: Array<{ latitude: number; longitude: number }>;
    isRecommended: boolean;
    approved: boolean;
  }>;
}

export interface ListRoadStatusParams {
  page?: number;
  limit?: number;
  region?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
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
  road: string;
  section?: string;
  area?: string;
  region: string;
  status: RoadStatus['status'];
  title: string;
  description?: string;
  startDate?: string;
  expectedCompletion?: string;
  alternativeRoute?: string; // Legacy field
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  affectedLanes?: string;
  contractor?: string;
  estimatedDuration?: string;
  published?: boolean;
  priority?: RoadStatus['priority'];
  // New structured alternate routes fields
  roadClosure?: {
    roadCode: string;
    startTown?: string;
    endTown?: string;
    startCoordinates: { latitude: number; longitude: number };
    endCoordinates: { latitude: number; longitude: number };
    polylineCoordinates?: Array<{ latitude: number; longitude: number }>;
  };
  alternateRoutes?: Array<{
    routeName: string;
    roadsUsed: string[];
    waypoints: Array<{
      name: string;
      coordinates: { latitude: number; longitude: number };
    }>;
    vehicleType?: string[];
    distanceKm?: number;
    estimatedTime?: string;
    polylineCoordinates?: Array<{ latitude: number; longitude: number }>;
    isRecommended?: boolean;
    approved?: boolean;
  }>;
}

export interface RoadStatusUpdateInput extends Partial<RoadStatusCreateInput> {
  completedAt?: string;
}

export const getRoadStatusList = async (params: ListRoadStatusParams = {}): Promise<ListRoadStatusResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.region) queryParams.append('region', params.region);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
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

// New methods for road closures with alternate routes
export const getRoadClosureWithRoutes = async (id: string): Promise<{
  success: boolean;
  data: {
    roadClosure: RoadStatus['roadClosure'];
    alternateRoutes: RoadStatus['alternateRoutes'];
  };
}> => {
  const response = await apiClient.get(`/road-status/road-closures/${id}`);
  return response.data;
};

export const createRoadClosureWithRoutes = async (data: {
  roadClosure: RoadStatus['roadClosure'];
  alternateRoutes: RoadStatus['alternateRoutes'];
  title: string;
  description?: string;
  region: string;
  startDate?: string;
  expectedCompletion?: string;
  published?: boolean;
  priority?: RoadStatus['priority'];
}): Promise<RoadStatusResponse> => {
  const response = await apiClient.post('/road-status/road-closures', data);
  return response.data;
};

export const updateRoadClosureWithRoutes = async (id: string, data: {
  roadClosure?: RoadStatus['roadClosure'];
  alternateRoutes?: RoadStatus['alternateRoutes'];
  title?: string;
  description?: string;
  region?: string;
  startDate?: string;
  expectedCompletion?: string;
  published?: boolean;
  priority?: RoadStatus['priority'];
}): Promise<RoadStatusResponse> => {
  const response = await apiClient.put(`/road-status/road-closures/${id}`, data);
  return response.data;
};

export const approveAlternateRoute = async (roadworkId: string, routeIndex: number): Promise<RoadStatusResponse> => {
  const response = await apiClient.put(`/road-status/${roadworkId}/alternate-routes/${routeIndex}/approve`);
  return response.data;
};











