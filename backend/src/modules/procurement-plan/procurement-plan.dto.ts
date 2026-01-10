export interface CreateProcurementPlanDTO {
  fiscalYear: string;
  documentUrl: string;
  documentFileName: string;
  published?: boolean;
}

export interface UpdateProcurementPlanDTO {
  fiscalYear?: string;
  documentUrl?: string;
  documentFileName?: string;
  published?: boolean;
}

export interface ListProcurementPlanQuery {
  page?: number;
  limit?: number;
  fiscalYear?: string;
  published?: boolean;
  search?: string;
}

export interface BulkUploadProcurementPlanDTO {
  fiscalYears?: string[];
  published?: boolean;
}

