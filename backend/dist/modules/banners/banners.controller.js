"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannersController = exports.BannersController = void 0;
const banners_service_1 = require("./banners.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class BannersController {
    /**
     * Create a new banner
     * POST /api/banners
     */
    async createBanner(req, res, next) {
        try {
            // Validate required fields
            const { title, description, imageUrl, linkUrl, order, active } = req.body;
            if (!title || !imageUrl) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Title and imageUrl are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Create banner
            const banner = await banners_service_1.bannersService.createBanner({
                title,
                description,
                imageUrl,
                linkUrl,
                order,
                active,
            });
            logger_1.logger.info(`Banner created successfully: ${banner._id}`);
            res.status(201).json({
                success: true,
                data: {
                    banner: {
                        id: banner._id,
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
        }
        catch (error) {
            logger_1.logger.error('Create banner error:', error);
            next(error);
        }
    }
    /**
     * List all banners
     * GET /api/banners
     */
    async listBanners(req, res, next) {
        try {
            // Check if we should only return active banners
            // For mobile app (no auth), return only active banners
            // For admin dashboard (with auth), return all banners
            const activeOnly = !req.user;
            const banners = await banners_service_1.bannersService.listBanners({ activeOnly });
            res.status(200).json({
                success: true,
                data: {
                    banners: banners.map((banner) => ({
                        id: banner._id,
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
        }
        catch (error) {
            logger_1.logger.error('List banners error:', error);
            next(error);
        }
    }
    /**
     * Get a single banner by ID
     * GET /api/banners/:id
     */
    async getBanner(req, res, next) {
        try {
            const { id } = req.params;
            const banner = await banners_service_1.bannersService.getBannerById(id);
            res.status(200).json({
                success: true,
                data: {
                    banner: {
                        id: banner._id,
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
        }
        catch (error) {
            logger_1.logger.error('Get banner error:', error);
            next(error);
        }
    }
    /**
     * Update a banner
     * PUT /api/banners/:id
     */
    async updateBanner(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, imageUrl, linkUrl, order, active } = req.body;
            // Build update object with only provided fields
            const updateData = {};
            if (title !== undefined)
                updateData.title = title;
            if (description !== undefined)
                updateData.description = description;
            if (imageUrl !== undefined)
                updateData.imageUrl = imageUrl;
            if (linkUrl !== undefined)
                updateData.linkUrl = linkUrl;
            if (order !== undefined)
                updateData.order = order;
            if (active !== undefined)
                updateData.active = active;
            const banner = await banners_service_1.bannersService.updateBanner(id, updateData);
            logger_1.logger.info(`Banner updated successfully: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    banner: {
                        id: banner._id,
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
        }
        catch (error) {
            logger_1.logger.error('Update banner error:', error);
            next(error);
        }
    }
    /**
     * Delete a banner
     * DELETE /api/banners/:id
     */
    async deleteBanner(req, res, next) {
        try {
            const { id } = req.params;
            await banners_service_1.bannersService.deleteBanner(id);
            logger_1.logger.info(`Banner deleted: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Banner deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete banner error:', error);
            next(error);
        }
    }
}
exports.BannersController = BannersController;
exports.bannersController = new BannersController();
//# sourceMappingURL=banners.controller.js.map