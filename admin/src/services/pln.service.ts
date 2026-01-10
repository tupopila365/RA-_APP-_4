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

export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
}

export interface PhoneNumber {
  code: string;
  number: string;
}

export interface PLNApplication {
  id: string;
  _id?: string;
  referenceId: string;
  
  // Transaction Type
  transactionType: string;
  
  // Section A - Owner/Transferor
  idType: 'Traffic Register Number' | 'Namibia ID-doc' | 'Business Reg. No';
  trafficRegisterNumber?: string;
  businessRegNumber?: string;
  surname: string;
  initials: string;
  businessName?: string;
  postalAddress: Address;
  streetAddress: Address;
  telephoneHome?: PhoneNumber;
  telephoneDay?: PhoneNumber;
  cellNumber?: PhoneNumber;
  email?: string;
  
  // Legacy fields (for backward compatibility)
  fullName?: string;
  idNumber?: string;
  phoneNumber?: string;
  
  // Section B - Personalised Number Plate
  plateFormat: 'Long/German' | 'Normal' | 'American' | 'Square' | 'Small motorcycle';
  quantity: 1 | 2;
  plateChoices: PlateChoice[];
  
  // Section C - Representative/Proxy (optional)
  hasRepresentative?: boolean;
  representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  representativeIdNumber?: string;
  representativeSurname?: string;
  representativeInitials?: string;
  
  // Section D - Vehicle Particulars (optional)
  hasVehicle?: boolean;
  currentLicenceNumber?: string;
  vehicleRegisterNumber?: string;
  chassisNumber?: string;
  vehicleMake?: string;
  seriesName?: string;
  
  // Section E - Declaration
  declarationAccepted: boolean;
  declarationDate: string;
  declarationPlace: string;
  declarationRole?: 'applicant' | 'proxy' | 'representative';
  
  // Document and status
  documentUrl: string;
  status: PLNStatus;
  statusHistory: StatusHistory[];
  adminComments?: string;
  paymentDeadline?: string;
  paymentReceivedAt?: string;
  
  // Additional admin fields
  assignedTo?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  internalNotes?: string;
  
  // Payment information
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Processing information
  processedBy?: string;
  processedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Plate production information
  plateOrderNumber?: string;
  plateSupplier?: string;
  plateOrderedAt?: string;
  plateDeliveredAt?: string;
  plateCollectedAt?: string;
  plateCollectedBy?: string;
  
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
      recentApplications: PLNApplication[];
      paymentOverdue: number;
      monthlyStats: { month: string; count: number }[];
    };
  };
}

/**
 * Submit a new PLN application (public) - Enhanced for new structure
 */
export const submitApplication = async (
  data: {
    // New structure fields
    idType?: string;
    trafficRegisterNumber?: string;
    businessRegNumber?: string;
    surname?: string;
    initials?: string;
    businessName?: string;
    postalAddress?: Address;
    streetAddress?: Address;
    telephoneHome?: PhoneNumber;
    telephoneDay?: PhoneNumber;
    cellNumber?: PhoneNumber;
    email?: string;
    plateFormat?: string;
    quantity?: number;
    plateChoices: PlateChoice[];
    hasRepresentative?: boolean;
    representativeIdType?: string;
    representativeIdNumber?: string;
    representativeSurname?: string;
    representativeInitials?: string;
    currentLicenceNumber?: string;
    vehicleRegisterNumber?: string;
    chassisNumber?: string;
    vehicleMake?: string;
    seriesName?: string;
    declarationAccepted?: boolean;
    declarationPlace?: string;
    declarationRole?: string;
    
    // Legacy fields (for backward compatibility)
    fullName?: string;
    idNumber?: string;
    phoneNumber?: string;
  },
  file: File
): Promise<PLNResponse> => {
  const formData = new FormData();
  
  // Add all fields to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
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
 * Update admin comments (admin)
 */
export const updateAdminComments = async (id: string, comments: string): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/comments`, {
    comments,
  });
  return response.data;
};

/**
 * Assign application to admin (admin)
 */
export const assignToAdmin = async (id: string, assignedTo: string): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/assign`, {
    assignedTo,
  });
  return response.data;
};

/**
 * Set application priority (admin)
 */
export const setPriority = async (
  id: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
): Promise<PLNResponse> => {
  const response = await apiClient.put<PLNResponse>(`/pln/applications/${id}/priority`, {
    priority,
  });
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

/**
 * Download blank PLN form PDF (public)
 */
export const downloadBlankForm = async (): Promise<void> => {
  const response = await apiClient.get('/pln/form', {
    responseType: 'blob',
  });

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'PLN-FORM.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};



