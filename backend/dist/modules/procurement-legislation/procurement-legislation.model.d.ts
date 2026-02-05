export interface IProcurementLegislation {
    section: 'act' | 'regulations' | 'guidelines';
    title: string;
    documentUrl: string;
    documentFileName: string;
    published: boolean;
    publishedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=procurement-legislation.model.d.ts.map