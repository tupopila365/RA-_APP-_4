export interface CreateProcurementAwardDTO {
    type: 'opportunities' | 'rfq';
    procurementReference: string;
    description: string;
    executiveSummary: {
        title: string;
        url: string;
        fileName: string;
    };
    successfulBidder: string;
    dateAwarded: Date;
    published?: boolean;
}
export interface UpdateProcurementAwardDTO {
    type?: 'opportunities' | 'rfq';
    procurementReference?: string;
    description?: string;
    executiveSummary?: {
        title: string;
        url: string;
        fileName: string;
    };
    successfulBidder?: string;
    dateAwarded?: Date;
    published?: boolean;
}
export interface ListProcurementAwardQuery {
    page?: number;
    limit?: number;
    type?: 'opportunities' | 'rfq';
    published?: boolean;
    search?: string;
}
export interface BulkUploadProcurementAwardDTO {
    type: 'opportunities' | 'rfq';
    published?: boolean;
}
//# sourceMappingURL=procurement-awards.dto.d.ts.map