import { ITender } from './tenders.model';
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
    tenders: ITender[];
    total: number;
    page: number;
    totalPages: number;
}
declare class TendersService {
    /**
     * Create a new tender
     */
    createTender(dto: CreateTenderDTO): Promise<ITender>;
    /**
     * List tenders with pagination, filtering, and search
     */
    listTenders(query: ListTendersQuery): Promise<ListTendersResult>;
    /**
     * Get a single tender by ID
     */
    getTenderById(tenderId: string): Promise<ITender>;
    /**
     * Update a tender
     */
    updateTender(tenderId: string, dto: UpdateTenderDTO): Promise<ITender>;
    /**
     * Delete a tender
     */
    deleteTender(tenderId: string): Promise<void>;
}
export declare const tendersService: TendersService;
export {};
//# sourceMappingURL=tenders.service.d.ts.map