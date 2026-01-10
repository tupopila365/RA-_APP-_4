import apiClient from './api';

// Types
export interface ProcurementLegislation {
  id: string;
  section: 'act' | 'regulations' | 'guidelines';
  title: string;
  documentUrl: string;
  documentFileName: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementPlan {
  id: string;
  fiscalYear: string;
  documentUrl: string;
  documentFileName: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementAward {
  id: string;
  type: 'opportunities' | 'rfq';
  procurementReference: string;
  description: string;
  executiveSummary: {
    title: string;
    url: string;
    fileName: string;
  };
  successfulBidder: string;
  dateAwarded: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementOpeningRegister {
  id: string;
  type: 'opportunities' | 'rfq';
  reference: string;
  description: string;
  bidOpeningDate: string;
  status: 'open' | 'closed';
  noticeUrl: string;
  noticeFileName: string;
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Procurement Legislation Service
export const procurementLegislationService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    section?: 'act' | 'regulations' | 'guidelines';
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/procurement-legislation', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/procurement-legislation/${id}`);
    return response.data;
  },

  create: async (data: {
    section: 'act' | 'regulations' | 'guidelines';
    title: string;
    documentUrl: string;
    documentFileName: string;
    published?: boolean;
  }) => {
    const response = await apiClient.post('/procurement-legislation', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProcurementLegislation>) => {
    const response = await apiClient.put(`/procurement-legislation/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/procurement-legislation/${id}`);
    return response.data;
  },

  bulkUpload: async (formData: FormData) => {
    const response = await apiClient.post('/procurement-legislation/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Procurement Plan Service
export const procurementPlanService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    fiscalYear?: string;
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/procurement-plan', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/procurement-plan/${id}`);
    return response.data;
  },

  create: async (data: {
    fiscalYear: string;
    documentUrl: string;
    documentFileName: string;
    published?: boolean;
  }) => {
    const response = await apiClient.post('/procurement-plan', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProcurementPlan>) => {
    const response = await apiClient.put(`/procurement-plan/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/procurement-plan/${id}`);
    return response.data;
  },

  bulkUpload: async (formData: FormData) => {
    const response = await apiClient.post('/procurement-plan/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Procurement Awards Service
export const procurementAwardsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: 'opportunities' | 'rfq';
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/procurement-awards', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/procurement-awards/${id}`);
    return response.data;
  },

  create: async (data: {
    type: 'opportunities' | 'rfq';
    procurementReference: string;
    description: string;
    executiveSummary: {
      title: string;
      url: string;
      fileName: string;
    };
    successfulBidder: string;
    dateAwarded: string;
    published?: boolean;
  }) => {
    const response = await apiClient.post('/procurement-awards', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProcurementAward>) => {
    const response = await apiClient.put(`/procurement-awards/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/procurement-awards/${id}`);
    return response.data;
  },

  bulkUpload: async (formData: FormData) => {
    const response = await apiClient.post('/procurement-awards/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Procurement Opening Register Service
export const procurementOpeningRegisterService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    type?: 'opportunities' | 'rfq';
    status?: 'open' | 'closed';
    category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
    published?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get('/procurement-opening-register', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get(`/procurement-opening-register/${id}`);
    return response.data;
  },

  create: async (data: {
    type: 'opportunities' | 'rfq';
    reference: string;
    description: string;
    bidOpeningDate: string;
    status: 'open' | 'closed';
    noticeUrl: string;
    noticeFileName: string;
    category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
    published?: boolean;
  }) => {
    const response = await apiClient.post('/procurement-opening-register', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProcurementOpeningRegister>) => {
    const response = await apiClient.put(`/procurement-opening-register/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/procurement-opening-register/${id}`);
    return response.data;
  },

  bulkUpload: async (formData: FormData) => {
    const response = await apiClient.post('/procurement-opening-register/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

