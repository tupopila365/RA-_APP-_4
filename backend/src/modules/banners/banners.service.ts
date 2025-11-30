import { BannerModel, IBanner } from './banners.model';
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
  /**
   * Create a new banner
   */
  async createBanner(dto: CreateBannerDTO): Promise<IBanner> {
    try {
      logger.info('Creating banner:', { title: dto.title });

      const banner = await BannerModel.create({
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        order: dto.order !== undefined ? dto.order : 0,
        active: dto.active !== undefined ? dto.active : true,
      });

      logger.info(`Banner created with ID: ${banner._id}`);
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

  /**
   * List banners with optional filtering for active banners only
   * Returns banners ordered by order field
   */
  async listBanners(query: ListBannersQuery = {}): Promise<IBanner[]> {
    try {
      // Build filter
      const filter: any = {};

      // If activeOnly is true, only return active banners
      if (query.activeOnly === true) {
        filter.active = true;
      }

      // Execute query ordered by order field
      const banners = await BannerModel.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return banners as unknown as IBanner[];
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

  /**
   * Get a single banner by ID
   */
  async getBannerById(bannerId: string): Promise<IBanner> {
    try {
      const banner = await BannerModel.findById(bannerId).lean();

      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }

      return banner as unknown as IBanner;
    } catch (error: any) {
      logger.error('Get banner error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve banner',
        details: error.message,
      };
    }
  }

  /**
   * Update a banner
   */
  async updateBanner(bannerId: string, dto: UpdateBannerDTO): Promise<IBanner> {
    try {
      logger.info(`Updating banner: ${bannerId}`);

      const banner = await BannerModel.findByIdAndUpdate(
        bannerId,
        dto,
        { new: true, runValidators: true }
      ).lean();

      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }

      logger.info(`Banner ${bannerId} updated successfully`);
      return banner as unknown as IBanner;
    } catch (error: any) {
      logger.error('Update banner error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update banner',
        details: error.message,
      };
    }
  }

  /**
   * Delete a banner
   */
  async deleteBanner(bannerId: string): Promise<void> {
    try {
      logger.info(`Deleting banner: ${bannerId}`);

      const banner = await BannerModel.findByIdAndDelete(bannerId);

      if (!banner) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Banner not found',
        };
      }

      logger.info(`Banner ${bannerId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete banner error:', error);
      if (error.statusCode) {
        throw error;
      }
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
