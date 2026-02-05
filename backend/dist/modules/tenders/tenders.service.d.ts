import { Tender } from './tenders.entity';
export interface CreateTenderDTO {
    referenceNumber: string;
    title: string;
    description: string;
    category: string;
    value?: number;
    status: 'open' | 'closed' | 'upcoming';
    openingDate: Date;
    closingDate: Date;
    pdfUrl: string;
    published?: boolean;
}
export interface UpdateTenderDTO {
    referenceNumber?: string;
    title?: string;
    description?: string;
    category?: string;
    value?: number;
    status?: 'open' | 'closed' | 'upcoming';
    openingDate?: Date;
    closingDate?: Date;
    pdfUrl?: string;
    published?: boolean;
}
export interface ListTendersQuery {
    page?: number;
    limit?: number;
    status?: 'open' | 'closed' | 'upcoming';
    category?: string;
    published?: boolean;
    search?: string;
}
export interface ListTendersResult {
    tenders: Tender[];
    total: number;
    page: number;
    totalPages: number;
}
declare class TendersService {
    createTender(dto: CreateTenderDTO): Promise<Tender>;
    listTenders(query: ListTendersQuery): Promise<ListTendersResult>;
    getTenderById(tenderId: string): Promise<Tender>;
    updateTender(tenderId: string, dto: UpdateTenderDTO): Promise<Tender>;
    deleteTender(tenderId: string): Promise<void>;
}
export declare const tendersService: TendersService;
export {};
//# sourceMappingURL=tenders.service.d.ts.map