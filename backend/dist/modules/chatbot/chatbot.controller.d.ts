import { Request, Response, NextFunction } from 'express';
declare class ChatbotController {
    /**
     * Handle chatbot query request with streaming
     * POST /api/chatbot/query/stream
     */
    queryStream(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle chatbot query request
     * POST /api/chatbot/query
     */
    query(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Health check endpoint for chatbot service
     * GET /api/chatbot/health
     */
    health(_req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const chatbotController: ChatbotController;
export {};
//# sourceMappingURL=chatbot.controller.d.ts.map