import apiClient from './api';

export type PLNStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PLATES_ORDERED'
  | 'READY_FOR_COLLECTION'
  | 'EXPIRED';

export interface PlateChoice {
  text: string;
  meaning: string;
}

export interface StatusHistory {
  status: PLNStatus;
  changedBy: string;
  timestamp: string;
  comment?: string;
}

export interface PLNApplication {
  id: string;
  _id?: string;
  referenceId: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  plateChoices: PlateChoice[];
  documentUrl: string;
  status: PLNStatus;
  statusHistory: StatusHistory[];
  adminComments?: string;
  paymentDeadline?: string;
  paymentReceivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PLNListResponse {
  success: boolean;
  data: {
    applications: PLNApplication[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface PLNResponse {
  success: boolean;
  data: {
    application: PLNApplication;
  };
}

export interface PLNStatsResponse {
  success: boolean;
  data: {
    stats: {
      total: number;
      byStatus: Record<PLNStatus, number>;
    };
  };
}

/**
 * Submit a new PLN application (public)
 */
export const submitApplication = async (
  data: {
    fullName: string;
    idNumber: string;
    phoneNumber: string;
    plateChoices: PlateChoice[];
  },
  file: File
): Promise<PLNResponse> => {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('idNumber', data.idNumber);
  formData.append('phoneNumber', data.phoneNumber);
  formData.append('plateChoices', JSON.stringify(data.plateChoices));
  formData.append('document', file);

  const response = await apiClient.post<PLNResponse>('/pln/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Track application by reference ID and ID number (public)
 */
export const trackApplication = async (
  referenceId: string,
  idNumber: string
): Promise<PLNResponse> => {
  const response = await apiClient.get<PLNResponse>(`/pln/track/${referenceId}/${idNumber}`);
  return response.data;
};

/**
 * List all applications (admin)
 */
export const listApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: PLNStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PLNListResponse> => {
  const response = await apiClient.get<PLNListResponse>('/pln/applications', { params });
  return response.data;
};

/**
 * Get application by ID (admin)
 */
export const getApplicationById = async (id: string): Promise<PLNResponse> => {
  const response = await apiClient.get<PLNResponse>(`/pln/applications/${id}`);
  return response.data;
};

/**
 * Update application status (admin)
 */
export const updateStatus = async (
  id: string,
  status: PLNStatus,
  comment?: string
): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/status`, {
    status,
    comment,
  });
  return response.data;
};

/**
 * Mark payment as received (admin)
 */
export const markPaymentReceived = async (id: string): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/payment`);
  return response.data;
};

/**
 * Order plates (admin)
 */
export const orderPlates = async (id: string): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/order-plates`);
  return response.data;
};

/**
 * Mark ready for collection (admin)
 */
export const markReadyForCollection = async (id: string): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/ready`);
  return response.data;
};

/**
 * Get dashboard statistics (admin)
 */
export const getDashboardStats = async (): Promise<PLNStatsResponse> => {
  const response = await apiClient.get<PLNStatsResponse>('/pln/dashboard/stats');
  return response.data;
};

/**
 * Download application form as PDF (admin)
 */
export const downloadApplicationPDF = async (id: string): Promise<void> => {
  const response = await apiClient.get(`/pln/applications/${id}/download-pdf`, {
    responseType: 'blob',
  });

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PLN-Application-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};



