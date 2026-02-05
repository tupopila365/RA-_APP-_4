import { News } from './news.entity';
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
    news: News[];
    total: number;
    page: number;
    totalPages: number;
}
declare class NewsService {
    createNews(dto: CreateNewsDTO): Promise<News>;
    listNews(query: ListNewsQuery): Promise<ListNewsResult>;
    getNewsById(newsId: string): Promise<News>;
    updateNews(newsId: string, dto: UpdateNewsDTO): Promise<News>;
    deleteNews(newsId: string): Promise<void>;
}
export declare const newsService: NewsService;
export {};
//# sourceMappingURL=news.service.d.ts.map