import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { raServicesService } from './ra-services.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

const mapServiceToResponse = (item: any) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  requirements: item.requirements,
  fee: item.fee,
  ageRestriction: item.ageRestriction,
  category: item.category,
  imageUrl: item.imageUrl,
  pdfs: item.pdfs,
  contactInfo: item.contactInfo,
  published: item.published,
  sortOrder: item.sortOrder,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export class RAServicesController {
  /**
   * Create a new RA service
   * POST /api/ra-services
   */
  async createService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        description,
        requirements,
        fee,
        ageRestriction,
        category,
        imageUrl,
        pdfs,
        contactInfo,
        published,
        sortOrder,
      } = req.body;

      if (!name || !description || !category) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Name, description, and category are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const service = await raServicesService.createService({
        name,
        description,
        requirements: Array.isArray(requirements) ? requirements : [],
        fee: fee || '',
        ageRestriction,
        category,
        imageUrl,
        pdfs: Array.isArray(pdfs) ? pdfs : [],
        contactInfo,
        published: published === true,
        sortOrder: sortOrder ?? 0,
      });

      res.status(201).json({
        success: true,
        data: {
          service: mapServiceToResponse(service),
          message: 'RA Service created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create RA service error:', error);
      next(error);
    }
  }

  /**
   * List RA services with pagination, filtering, and search
   * GET /api/ra-services
   */
  async listServices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;
      const published =
        req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await raServicesService.listServices({
        page,
        limit,
        category,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map(mapServiceToResponse),
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('List RA services error:', error);
      next(error);
    }
  }

  /**
   * Get a single RA service by ID
   * GET /api/ra-services/:id
   */
  async getService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const service = await raServicesService.getServiceById(id);

      res.status(200).json({
        success: true,
        data: {
          service: mapServiceToResponse(service),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get RA service error:', error);
      next(error);
    }
  }

  /**
   * Update RA service
   * PUT /api/ra-services/:id
   */
  async updateService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        requirements,
        fee,
        ageRestriction,
        category,
        imageUrl,
        pdfs,
        contactInfo,
        published,
        sortOrder,
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (requirements !== undefined) updateData.requirements = Array.isArray(requirements) ? requirements : [];
      if (fee !== undefined) updateData.fee = fee;
      if (ageRestriction !== undefined) updateData.ageRestriction = ageRestriction;
      if (category !== undefined) updateData.category = category;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (pdfs !== undefined) updateData.pdfs = Array.isArray(pdfs) ? pdfs : [];
      if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
      if (published !== undefined) updateData.published = published === true;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      const service = await raServicesService.updateService(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          service: mapServiceToResponse(service),
          message: 'RA Service updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update RA service error:', error);
      next(error);
    }
  }

  /**
   * Delete RA service
   * DELETE /api/ra-services/:id
   */
  async deleteService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Service ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await raServicesService.deleteService(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'RA Service deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete RA service error:', error);
      next(error);
    }
  }
}

export const raServicesController = new RAServicesController();
