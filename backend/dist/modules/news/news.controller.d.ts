import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class NewsController {
    /**
     * Create a new news article
     * POST /api/news
     */
    createNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all news articles with pagination, filtering, and search
     * GET /api/news
     */
    listNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single news article by ID
     * GET /api/news/:id
     */
    getNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a news article
     * PUT /api/news/:id
     */
    updateNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a news article
     * DELETE /api/news/:id
     */
    deleteNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const newsController: NewsController;
//# sourceMappingURL=news.controller.d.ts.map