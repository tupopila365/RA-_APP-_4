import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class BannersController {
    /**
     * Create a new banner
     * POST /api/banners
     */
    createBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all banners
     * GET /api/banners
     */
    listBanners(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single banner by ID
     * GET /api/banners/:id
     */
    getBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a banner
     * PUT /api/banners/:id
     */
    updateBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a banner
     * DELETE /api/banners/:id
     */
    deleteBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const bannersController: BannersController;
//# sourceMappingURL=banners.controller.d.ts.map