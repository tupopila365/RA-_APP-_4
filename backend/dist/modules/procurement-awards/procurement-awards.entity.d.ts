export declare class ProcurementAward {
    id: number;
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
    published: boolean;
    publishedAt: Date | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=procurement-awards.entity.d.ts.map