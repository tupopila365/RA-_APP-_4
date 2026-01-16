import apiClient from './api';

export interface PotholeReport {
  id: string;
  deviceId: string;
  referenceCode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  town: string;
  region: string;
  roadName: string;
  photoUrl: string;
  severity?: 'low' | 'medium' | 'high'; // Optional - admin-only field
  description?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';
  assignedTo?: string;
  adminNotes?: string;
  repairPhotoUrl?: string;
  fixedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListReportsParams {
  page?: number;
  limit?: number;
  deviceId?: string;
  region?: string;
  town?: string;
  severity?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListReportsResponse {
  success: boolean;
  data: {
    reports: PotholeReport[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface ReportResponse {
  success: boolean;
  data: {
    report: PotholeReport;
  };
}

export interface RegionsTownsResponse {
  success: boolean;
  data: {
    regions: string[];
    towns: string[];
  };
}

export const getReportsList = async (params: ListReportsParams = {}): Promise<ListReportsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.deviceId) queryParams.append('deviceId', params.deviceId);
  if (params.region) queryParams.append('region', params.region);
  if (params.town) queryParams.append('town', params.town);
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `/pothole-reports?${queryParams.toString()}`;
  console.log('API Request URL:', url);
  
  try {
    const response = await apiClient.get(url);
    console.log('API Response:', response);
    console.log('API Response Data:', response.data);
    
    // Validate response structure
    if (!response.data || !response.data.data) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response structure from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error in getReportsList:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const getReportById = async (id: string): Promise<ReportResponse> => {
  const response = await apiClient.get(`/pothole-reports/${id}`);
  return response.data;
};

export const updateReportStatus = async (
  id: string,
  status: PotholeReport['status'],
  updates?: { assignedTo?: string; adminNotes?: string; severity?: PotholeReport['severity'] }
): Promise<ReportResponse> => {
  const response = await apiClient.put(`/pothole-reports/${id}/status`, {
    status,
    ...updates,
  });
  return response.data;
};

export const assignReport = async (id: string, assignedTo: string): Promise<ReportResponse> => {
  const response = await apiClient.put(`/pothole-reports/${id}/assign`, {
    assignedTo,
  });
  return response.data;
};

export const addAdminNotes = async (id: string, adminNotes: string): Promise<ReportResponse> => {
  const response = await apiClient.put(`/pothole-reports/${id}/notes`, {
    adminNotes,
  });
  return response.data;
};

export const markAsFixed = async (id: string, repairPhoto?: File): Promise<ReportResponse> => {
  const formData = new FormData();
  if (repairPhoto) {
    formData.append('repairPhoto', repairPhoto);
  }

  const response = await apiClient.put(`/pothole-reports/${id}/fixed`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteReport = async (id: string): Promise<void> => {
  await apiClient.delete(`/pothole-reports/${id}`);
};

export const getRegionsAndTowns = async (): Promise<RegionsTownsResponse> => {
  const response = await apiClient.get('/pothole-reports/filters/regions-towns');
  return response.data;
};

