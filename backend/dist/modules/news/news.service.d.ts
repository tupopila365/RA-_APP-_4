import { INews } from './news.model';
export interface CreateNewsDTO {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    author: string;
    imageUrl?: string;
    published?: boolean;
}
export interface UpdateNewsDTO {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    author?: string;
    imageUrl?: string;
    published?: boolean;
}
export interface ListNewsQuery {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
}
export interface ListNewsResult {
    news: INews[];
    total: number;
    page: number;
    totalPages: number;
}
declare class NewsService {
    /**
     * Create a new news article
     */
    createNews(dto: CreateNewsDTO): Promise<INews>;
    /**
     * List news articles with pagination, filtering, and search
     */
    listNews(query: ListNewsQuery): Promise<ListNewsResult>;
    /**
     * Get a single news article by ID
     */
    getNewsById(newsId: string): Promise<INews>;
    /**
     * Update a news article
     */
    updateNews(newsId: string, dto: UpdateNewsDTO): Promise<INews>;
    /**
     * Delete a news article
     */
    deleteNews(newsId: string): Promise<void>;
}
export declare const newsService: NewsService;
export {};
//# sourceMappingURL=news.service.d.ts.map