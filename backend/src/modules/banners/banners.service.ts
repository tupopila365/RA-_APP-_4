import { AppDataSource } from '../../config/db';
import { Banner } from './banners.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateBannerDTO {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateBannerDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
}

export interface ListBannersQuery {
  activeOnly?: boolean;
}

class BannersService {
  async createBanner(dto: CreateBannerDTO): Promise<Banner> {
    try {
      logger.info('Creating banner:', { title: dto.title });
      const repo = AppDataSource.getRepository(Banner);
      const banner = repo.create({
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        order: dto.order !== undefined ? dto.order : 0,
        active: dto.active !== undefined ? dto.active : true,
      });
      await repo.save(banner);
      logger.info(`Banner created with ID: ${banner.id}`);
      return banner;
    } catch (error: any) {
      logger.error('Create banner error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create banner',
        details: error.message,
      };
    }
  }

  async listBanners(query: ListBannersQuery = {}): Promise<Banner[]> {
    try {
      const repo = AppDataSource.getRepository(Banner);
      const where: any = {};
      if (query.activeOnly === true) where.active = true;
      const banners = await repo.find({
        where,
        order: { order: 'ASC', createdAt: 'DESC' },
      });
      return banners;
    } catch (error: any) {
      logger.error('List banners error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve banners',
        details: error.message,
      };
    }
  }

  async getBannerById(bannerId: string): Promise<Banner> {
    try {
      const id = parseInt(bannerId, 10);
      const repo = AppDataSource.getRepository(Banner);
      const banner = await repo.findOne({ where: { id } });
      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }
      return banner;
    } catch (error: any) {
      logger.error('Get banner error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve banner',
        details: error.message,
      };
    }
  }

  async updateBanner(bannerId: string, dto: UpdateBannerDTO): Promise<Banner> {
    try {
      logger.info(`Updating banner: ${bannerId}`);
      const id = parseInt(bannerId, 10);
      const repo = AppDataSource.getRepository(Banner);
      const banner = await repo.findOne({ where: { id } });
      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }
      Object.assign(banner, dto);
      await repo.save(banner);
      logger.info(`Banner ${bannerId} updated successfully`);
      return banner;
    } catch (error: any) {
      logger.error('Update banner error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update banner',
        details: error.message,
      };
    }
  }

  async deleteBanner(bannerId: string): Promise<void> {
    try {
      logger.info(`Deleting banner: ${bannerId}`);
      const id = parseInt(bannerId, 10);
      const repo = AppDataSource.getRepository(Banner);
      const banner = await repo.findOne({ where: { id } });
      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }
      await repo.remove(banner);
      logger.info(`Banner ${bannerId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete banner error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete banner',
        details: error.message,
      };
    }
  }
}

export const bannersService = new BannersService();
