export interface IExecutiveSummary {
  title: string;
  url: string;
  fileName: string;
}

export interface IProcurementAward {
  type: 'opportunities' | 'rfq';
  procurementReference: string;
  description: string;
  executiveSummary: IExecutiveSummary;
  successfulBidder: string;
  dateAwarded: Date;
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
