export interface ITender {
    referenceNumber: string;
    title: string;
    description: string;
    category: string;
    value?: number;
    status: 'open' | 'closed' | 'upcoming';
    openingDate: Date;
    closingDate: Date;
    pdfUrl: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=tenders.model.d.ts.map