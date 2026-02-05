export declare class ProcurementOpeningRegister {
    id: number;
    type: 'opportunities' | 'rfq';
    reference: string;
    description: string;
    bidOpeningDate: Date;
    status: 'open' | 'closed';
    noticeUrl: string;
    noticeFileName: string;
    category: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works' | null;
    published: boolean;
    publishedAt: Date | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=procurement-opening-register.entity.d.ts.map