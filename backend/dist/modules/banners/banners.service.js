"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannersService = void 0;
const db_1 = require("../../config/db");
const banners_entity_1 = require("./banners.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class BannersService {
    async createBanner(dto) {
        try {
            logger_1.logger.info('Creating banner:', { title: dto.title });
            const repo = db_1.AppDataSource.getRepository(banners_entity_1.Banner);
            const banner = repo.create({
                title: dto.title,
                description: dto.description,
                imageUrl: dto.imageUrl,
                linkUrl: dto.linkUrl,
                order: dto.order !== undefined ? dto.order : 0,
                active: dto.active !== undefined ? dto.active : true,
            });
            await repo.save(banner);
            logger_1.logger.info(`Banner created with ID: ${banner.id}`);
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
    async listBanners(query = {}) {
        try {
            const repo = db_1.AppDataSource.getRepository(banners_entity_1.Banner);
            const where = {};
            if (query.activeOnly === true)
                where.active = true;
            const banners = await repo.find({
                where,
                order: { order: 'ASC', createdAt: 'DESC' },
            });
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
    async getBannerById(bannerId) {
        try {
            const id = parseInt(bannerId, 10);
            const repo = db_1.AppDataSource.getRepository(banners_entity_1.Banner);
            const banner = await repo.findOne({ where: { id } });
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
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve banner',
                details: error.message,
            };
        }
    }
    async updateBanner(bannerId, dto) {
        try {
            logger_1.logger.info(`Updating banner: ${bannerId}`);
            const id = parseInt(bannerId, 10);
            const repo = db_1.AppDataSource.getRepository(banners_entity_1.Banner);
            const banner = await repo.findOne({ where: { id } });
            if (!banner) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Banner not found',
                };
            }
            Object.assign(banner, dto);
            await repo.save(banner);
            logger_1.logger.info(`Banner ${bannerId} updated successfully`);
            return banner;
        }
        catch (error) {
            logger_1.logger.error('Update banner error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update banner',
                details: error.message,
            };
        }
    }
    async deleteBanner(bannerId) {
        try {
            logger_1.logger.info(`Deleting banner: ${bannerId}`);
            const id = parseInt(bannerId, 10);
            const repo = db_1.AppDataSource.getRepository(banners_entity_1.Banner);
            const banner = await repo.findOne({ where: { id } });
            if (!banner) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Banner not found',
                };
            }
            await repo.remove(banner);
            logger_1.logger.info(`Banner ${bannerId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete banner error:', error);
            if (error.statusCode)
                throw error;
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