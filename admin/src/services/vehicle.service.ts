import apiClient from './api';

export type VehicleRegStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'REGISTERED'
  | 'EXPIRED';

export interface StatusHistory {
  status: VehicleRegStatus;
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

export interface VehicleRegApplication {
  id: string;
  _id?: string;
  referenceId: string;
  
  // Section A - Owner
  idType: 'Traffic Register Number' | 'Namibia ID-doc' | 'Business Reg. No';
  identificationNumber: string;
  personType?: 'male' | 'female' | 'one-man business' | 'Private company' | 'closed corporation' | 'other';
  surname?: string;
  initials?: string;
  businessName?: string;
  postalAddress: Address;
  streetAddress: Address;
  telephoneDay?: PhoneNumber;
  
  // Legacy/computed fields
  fullName?: string;
  
  // Section B - Proxy
  hasProxy?: boolean;
  proxyIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  proxyIdNumber?: string;
  proxySurname?: string;
  proxyInitials?: string;
  
  // Section C - Representative
  hasRepresentative?: boolean;
  representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  representativeIdNumber?: string;
  representativeSurname?: string;
  representativeInitials?: string;
  
  // Section D - Declaration
  declarationAccepted: boolean;
  declarationDate: string;
  declarationPlace: string;
  declarationRole?: 'owner' | 'proxy' | 'representative';
  
  // Section E - Vehicle
  registrationNumber?: string;
  make: string;
  seriesName: string;
  vehicleCategory?: string;
  drivenType: 'self-propelled' | 'trailer' | 'semi-trailer' | 'trailer drawn by tractor';
  vehicleDescription?: string;
  netPower?: string;
  engineCapacity?: string;
  fuelType: 'petrol' | 'diesel' | 'other';
  fuelTypeOther?: string;
  totalMass?: string;
  grossVehicleMass?: string;
  maxPermissibleVehicleMass?: string;
  maxPermissibleDrawingMass?: string;
  transmission: 'manual' | 'semi-automatic' | 'automatic';
  mainColour: 'white' | 'red' | 'blue' | 'other';
  mainColourOther?: string;
  usedForTransportation?: string;
  economicSector?: string;
  odometerReading?: string;
  odometerReadingKm?: string;
  vehicleStreetAddress?: Address;
  ownershipType: 'private' | 'business' | 'motor dealer';
  usedOnPublicRoad: boolean;
  
  // Section F - Office use
  chassisNumber?: string;
  engineNumber?: string;
  feesPaidRegistration?: string;
  receiptNumberRegistration?: string;
  feesPaidLicensing?: string;
  receiptNumberLicensing?: string;
  roadWorthinessCompliant?: boolean;
  roadWorthinessTestDate?: string;
  roadWorthinessCertificateNumber?: string;
  registrationReason?: 'first registration' | 'ownership transfer' | 're-register' | 'amalgamation' | 'built-up';
  policeClearanceSubmitted?: boolean;
  transactionEffectiveDate?: string;
  firstLicensingLiabilityDate?: string;
  registrationCertificateControlNumber?: string;
  vehicleStatus?: 'new' | 'used' | 'built-up' | 'reconstructed';
  
  // Document and status
  documentUrl: string;
  status: VehicleRegStatus;
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
  
  // Registration information
  registrationNumberAssigned?: string;
  registrationDate?: string;
  registrationCertificateUrl?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRegListResponse {
  success: boolean;
  data: {
    applications: VehicleRegApplication[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

export interface VehicleRegResponse {
  success: boolean;
  data: {
    application: VehicleRegApplication;
  };
}

export interface VehicleRegStatsResponse {
  success: boolean;
  data: {
    stats: {
      total: number;
      byStatus: Record<VehicleRegStatus, number>;
      recentApplications: VehicleRegApplication[];
      paymentOverdue: number;
      monthlyStats: { month: string; count: number }[];
    };
  };
}

/**
 * List all applications (admin)
 */
export const listApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: VehicleRegStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<VehicleRegListResponse> => {
  const response = await apiClient.get<VehicleRegListResponse>('/vehicle-reg/applications', { params });
  return response.data;
};

/**
 * Get application by ID (admin)
 */
export const getApplicationById = async (id: string): Promise<VehicleRegResponse> => {
  const response = await apiClient.get<VehicleRegResponse>(`/vehicle-reg/applications/${id}`);
  return response.data;
};

/**
 * Update application status (admin)
 */
export const updateStatus = async (
  id: string,
  status: VehicleRegStatus,
  comment?: string
): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/status`, {
    status,
    comment,
  });
  return response.data;
};

/**
 * Mark payment as received (admin)
 */
export const markPaymentReceived = async (id: string): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/payment`);
  return response.data;
};

/**
 * Mark as registered (admin)
 */
export const markRegistered = async (id: string, registrationNumber?: string): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/register`, {
    registrationNumber,
  });
  return response.data;
};

/**
 * Update admin comments (admin)
 */
export const updateAdminComments = async (id: string, comments: string): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/comments`, {
    comments,
  });
  return response.data;
};

/**
 * Assign application to admin (admin)
 */
export const assignToAdmin = async (id: string, assignedTo: string): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/assign`, {
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
): Promise<VehicleRegResponse> => {
  const response = await apiClient.put<VehicleRegResponse>(`/vehicle-reg/applications/${id}/priority`, {
    priority,
  });
  return response.data;
};

/**
 * Get dashboard statistics (admin)
 */
export const getDashboardStats = async (): Promise<VehicleRegStatsResponse> => {
  const response = await apiClient.get<VehicleRegStatsResponse>('/vehicle-reg/dashboard/stats');
  return response.data;
};

/**
 * Download application form as PDF (admin)
 */
export const downloadApplicationPDF = async (id: string): Promise<void> => {
  const response = await apiClient.get(`/vehicle-reg/applications/${id}/download-pdf`, {
    responseType: 'blob',
  });

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Vehicle-Registration-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download blank vehicle registration form PDF (public)
 */
export const downloadBlankForm = async (): Promise<void> => {
  const response = await apiClient.get('/vehicle-reg/form', {
    responseType: 'blob',
  });

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Vehicle-Registration-Form.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
