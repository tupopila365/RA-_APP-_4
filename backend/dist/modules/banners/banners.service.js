"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannersService = void 0;
const banners_model_1 = require("./banners.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class BannersService {
    /**
     * Create a new banner
     */
    async createBanner(dto) {
        try {
            logger_1.logger.info('Creating banner:', { title: dto.title });
            const banner = await banners_model_1.BannerModel.create({
                title: dto.title,
                description: dto.description,
                imageUrl: dto.imageUrl,
                linkUrl: dto.linkUrl,
                order: dto.order !== undefined ? dto.order : 0,
                active: dto.active !== undefined ? dto.active : true,
            });
            logger_1.logger.info(`Banner created with ID: ${banner._id}`);
            return banner;
        }
        catch (error) {
            logger_1.logger.error('Create banner error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create banner',
                details: error.message,
            };
        }
    }
    /**
     * List banners with optional filtering for active banners only
     * Returns banners ordered by order field
     */
    async listBanners(query = {}) {
        try {
            // Build filter
            const filter = {};
            // If activeOnly is true, only return active banners
            if (query.activeOnly === true) {
                filter.active = true;
            }
            // Execute query ordered by order field
            const banners = await banners_model_1.BannerModel.find(filter)
                .sort({ order: 1, createdAt: -1 })
                .lean();
            return banners;
        }
        catch (error) {
            logger_1.logger.error('List banners error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve banners',
                details: error.message,
            };
        }
    }
    /**
     * Get a single banner by ID
     */
    async getBannerById(bannerId) {
        try {
            const banner = await banners_model_1.BannerModel.findById(bannerId).lean();
            if (!banner) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Banner not found',
                };
            }
            return banner;
        }
        catch (error) {
            logger_1.logger.error('Get banner error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve banner',
                details: error.message,
            };
        }
    }
    /**
     * Update a banner
     */
    async updateBanner(bannerId, dto) {
        try {
            logger_1.logger.info(`Updating banner: ${bannerId}`);
            const banner = await banners_model_1.BannerModel.findByIdAndUpdate(bannerId, dto, { new: true, runValidators: true }).lean();
            if (!banner) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Banner not found',
                };
            }
            logger_1.logger.info(`Banner ${bannerId} updated successfully`);
            return banner;
        }
        catch (error) {
            logger_1.logger.error('Update banner error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update banner',
                details: error.message,
            };
        }
    }
    /**
     * Delete a banner
     */
    async deleteBanner(bannerId) {
        try {
            logger_1.logger.info(`Deleting banner: ${bannerId}`);
            const banner = await banners_model_1.BannerModel.findByIdAndDelete(bannerId);
            if (!banner) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Banner not found',
                };
            }
            logger_1.logger.info(`Banner ${bannerId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete banner error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete banner',
                details: error.message,
            };
        }
    }
}
exports.bannersService = new BannersService();
//# sourceMappingURL=banners.service.js.map