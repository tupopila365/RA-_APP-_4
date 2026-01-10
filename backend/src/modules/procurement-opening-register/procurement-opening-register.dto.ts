export interface CreateProcurementOpeningRegisterDTO {
  type: 'opportunities' | 'rfq';
  reference: string;
  description: string;
  bidOpeningDate: Date;
  status: 'open' | 'closed';
  noticeUrl: string;
  noticeFileName: string;
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published?: boolean;
}

export interface UpdateProcurementOpeningRegisterDTO {
  type?: 'opportunities' | 'rfq';
  reference?: string;
  description?: string;
  bidOpeningDate?: Date;
  status?: 'open' | 'closed';
  noticeUrl?: string;
  noticeFileName?: string;
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published?: boolean;
}

export interface ListProcurementOpeningRegisterQuery {
  page?: number;
  limit?: number;
  type?: 'opportunities' | 'rfq';
  status?: 'open' | 'closed';
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published?: boolean;
  search?: string;
}

export interface BulkUploadProcurementOpeningRegisterDTO {
  type: 'opportunities' | 'rfq';
  published?: boolean;
}

