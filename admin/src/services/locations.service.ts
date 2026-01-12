import apiClient from './api';

export interface Location {
  id: string;
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
  // NATIS-specific fields
  services?: string[];
  operatingHours?: {
    weekdays?: {
      open: string;
      close: string;
    };
    weekends?: {
      open: string;
      close: string;
    };
    publicHolidays?: {
      open: string;
      close: string;
    };
  };
  closedDays?: string[];
  specialHours?: Array<{
    date: string;
    reason: string;
    closed: boolean;
    hours?: {
      open: string;
      close: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string | undefined;
  email?: string | undefined;
  // NATIS-specific fields
  services?: string[];
  operatingHours?: {
    weekdays?: {
      open: string;
      close: string;
    };
    weekends?: {
      open: string;
      close: string;
    };
    publicHolidays?: {
      open: string;
      close: string;
    };
  };
  closedDays?: string[];
  specialHours?: Array<{
    date: string;
    reason: string;
    closed: boolean;
    hours?: {
      open: string;
      close: string;
    };
  }>;
}

export interface LocationListResponse {
  success: boolean;
  data: {
    locations: Location[];
    total: number;
  };
}

export interface LocationResponse {
  success: boolean;
  data: {
    location: Location;
  };
}

/**
 * Fetch all locations with optional region filtering
 */
export const getLocationsList = async (region?: string): Promise<LocationListResponse> => {
  const params = region ? { region } : {};
  const response = await apiClient.get<LocationListResponse>('/locations', { params });
  return response.data;
};

/**
 * Get single location by ID
 */
export const getLocationById = async (id: string): Promise<LocationResponse> => {
  const response = await apiClient.get<LocationResponse>(`/locations/${id}`);
  return response.data;
};

/**
 * Create new location
 */
export const createLocation = async (data: LocationFormData): Promise<LocationResponse> => {
  const response = await apiClient.post<LocationResponse>('/locations', data);
  return response.data;
};

/**
 * Update existing location
 */
export const updateLocation = async (id: string, data: LocationFormData): Promise<LocationResponse> => {
  const response = await apiClient.put<LocationResponse>(`/locations/${id}`, data);
  return response.data;
};

/**
 * Delete location
 */
export const deleteLocation = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/locations/${id}`);
  return response.data;
};
