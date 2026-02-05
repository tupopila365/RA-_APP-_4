import { FAQ } from './faqs.entity';
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
    faqs: FAQ[];
    total: number;
    page: number;
    totalPages: number;
}
declare class FAQService {
    createFAQ(dto: CreateFAQDTO): Promise<FAQ>;
    listFAQs(query: ListFAQsQuery): Promise<ListFAQsResult>;
    getFAQById(faqId: string): Promise<FAQ>;
    updateFAQ(faqId: string, dto: UpdateFAQDTO): Promise<FAQ>;
    deleteFAQ(faqId: string): Promise<void>;
}
export declare const faqsService: FAQService;
export {};
//# sourceMappingURL=faqs.service.d.ts.map