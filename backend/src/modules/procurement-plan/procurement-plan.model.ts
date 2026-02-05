export interface IProcurementPlan {
  fiscalYear: string;
  documentUrl: string;
  documentFileName: string;
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
