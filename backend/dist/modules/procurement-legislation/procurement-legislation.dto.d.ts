export interface CreateProcurementLegislationDTO {
    section: 'act' | 'regulations' | 'guidelines';
    title: string;
    documentUrl: string;
    documentFileName: string;
    published?: boolean;
}
export interface UpdateProcurementLegislationDTO {
    section?: 'act' | 'regulations' | 'guidelines';
    title?: string;
    documentUrl?: string;
    documentFileName?: string;
    published?: boolean;
}
export interface ListProcurementLegislationQuery {
    page?: number;
    limit?: number;
    section?: 'act' | 'regulations' | 'guidelines';
    published?: boolean;
    search?: string;
}
export interface BulkUploadProcurementLegislationDTO {
    section: 'act' | 'regulations' | 'guidelines';
    titles?: string[];
    published?: boolean;
}
//# sourceMappingURL=procurement-legislation.dto.d.ts.map