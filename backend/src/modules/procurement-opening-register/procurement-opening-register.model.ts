export interface IProcurementOpeningRegister {
  type: 'opportunities' | 'rfq';
  reference: string;
  description: string;
  bidOpeningDate: Date;
  status: 'open' | 'closed';
  noticeUrl: string;
  noticeFileName: string;
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
