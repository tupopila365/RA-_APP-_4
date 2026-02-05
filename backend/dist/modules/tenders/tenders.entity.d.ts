export declare class Tender {
    id: number;
    referenceNumber: string;
    title: string;
    description: string;
    category: string;
    value: number | null;
    status: 'open' | 'closed' | 'upcoming';
    openingDate: Date;
    closingDate: Date;
    pdfUrl: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=tenders.entity.d.ts.map