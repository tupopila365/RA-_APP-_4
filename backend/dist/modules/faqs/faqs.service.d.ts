import { IFAQ } from './faqs.model';
export interface CreateFAQDTO {
    question: string;
    answer: string;
    category?: string;
    order?: number;
}
export interface UpdateFAQDTO {
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
}
export interface ListFAQsQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}
export interface ListFAQsResult {
    faqs: IFAQ[];
    total: number;
    page: number;
    totalPages: number;
}
declare class FAQService {
    /**
     * Create a new FAQ
     */
    createFAQ(dto: CreateFAQDTO): Promise<IFAQ>;
    /**
     * List FAQs with pagination, filtering, and search
     */
    listFAQs(query: ListFAQsQuery): Promise<ListFAQsResult>;
    /**
     * Get a single FAQ by ID
     */
    getFAQById(faqId: string): Promise<IFAQ>;
    /**
     * Update a FAQ
     */
    updateFAQ(faqId: string, dto: UpdateFAQDTO): Promise<IFAQ>;
    /**
     * Delete a FAQ
     */
    deleteFAQ(faqId: string): Promise<void>;
}
export declare const faqsService: FAQService;
export {};
//# sourceMappingURL=faqs.service.d.ts.map