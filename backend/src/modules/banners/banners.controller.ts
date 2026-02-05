import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { bannersService } from './banners.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class BannersController {
  /**
   * Create a new banner
   * POST /api/banners
   */
  async createBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const { title, description, imageUrl, linkUrl, order, active } = req.body;

      if (!title || !imageUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Title and imageUrl are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create banner
      const banner = await bannersService.createBanner({
        title,
        description,
        imageUrl,
        linkUrl,
        order,
        active,
      });

      logger.info(`Banner created successfully: ${banner.id}`);

      res.status(201).json({
        success: true,
        data: {
          banner: {
            id: banner.id,
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            order: banner.order,
            active: banner.active,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
          },
          message: 'Banner created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create banner error:', error);
      next(error);
    }
  }

  /**
   * List all banners
   * GET /api/banners
   */
  async listBanners(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if we should only return active banners
      // For mobile app (no auth), return only active banners
      // For admin dashboard (with auth), return all banners
      const activeOnly = !req.user;

      const banners = await bannersService.listBanners({ activeOnly });

      res.status(200).json({
        success: true,
        data: {
          banners: banners.map((banner) => ({
            id: banner.id,
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            order: banner.order,
            active: banner.active,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('List banners error:', error);
      next(error);
    }
  }

  /**
   * Get a single banner by ID
   * GET /api/banners/:id
   */
  async getBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const banner = await bannersService.getBannerById(id);

      res.status(200).json({
        success: true,
        data: {
          banner: {
            id: banner.id,
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            order: banner.order,
            active: banner.active,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get banner error:', error);
      next(error);
    }
  }

  /**
   * Update a banner
   * PUT /api/banners/:id
   */
  async updateBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, imageUrl, linkUrl, order, active } = req.body;

      // Build update object with only provided fields
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
      if (order !== undefined) updateData.order = order;
      if (active !== undefined) updateData.active = active;

      const banner = await bannersService.updateBanner(id, updateData);

      logger.info(`Banner updated successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          banner: {
            id: banner.id,
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            order: banner.order,
            active: banner.active,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
          },
          message: 'Banner updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update banner error:', error);
      next(error);
    }
  }

  /**
   * Delete a banner
   * DELETE /api/banners/:id
   */
  async deleteBanner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await bannersService.deleteBanner(id);

      logger.info(`Banner deleted: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Banner deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete banner error:', error);
      next(error);
    }
  }
}

export const bannersController = new BannersController();
