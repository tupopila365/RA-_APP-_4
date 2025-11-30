import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { tendersService } from './tenders.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class TendersController {
  /**
   * Create a new tender
   * POST /api/tenders
   */
  async createTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const {
        referenceNumber,
        title,
        description,
        category,
        value,
        status,
        openingDate,
        closingDate,
        pdfUrl,
        published,
      } = req.body;

      if (!referenceNumber || !title || !description || !category || !status || !openingDate || !closingDate || !pdfUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Reference number, title, description, category, status, opening date, closing date, and PDF URL are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate status
      const validStatuses = ['open', 'closed', 'upcoming'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Status must be one of: open, closed, upcoming',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate dates
      const opening = new Date(openingDate);
      const closing = new Date(closingDate);
      
      if (isNaN(opening.getTime()) || isNaN(closing.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid date format for opening or closing date',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (closing <= opening) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Closing date must be after opening date',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate value if provided
      if (value !== undefined && (typeof value !== 'number' || value < 0)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Value must be a non-negative number',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create tender
      const tender = await tendersService.createTender({
        referenceNumber,
        title,
        description,
        category,
        value,
        status,
        openingDate: opening,
        closingDate: closing,
        pdfUrl,
        published: published === true,
      });

      logger.info(`Tender created successfully: ${tender._id}`);

      res.status(201).json({
        success: true,
        data: {
          tender: {
            id: tender._id,
            referenceNumber: tender.referenceNumber,
            title: tender.title,
            description: tender.description,
            category: tender.category,
            value: tender.value,
            status: tender.status,
            openingDate: tender.openingDate,
            closingDate: tender.closingDate,
            pdfUrl: tender.pdfUrl,
            published: tender.published,
            createdAt: tender.createdAt,
            updatedAt: tender.updatedAt,
          },
          message: 'Tender created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create tender error:', error);
      next(error);
    }
  }

  /**
   * List all tenders with pagination, filtering, and search
   * GET /api/tenders
   */
  async listTenders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as 'open' | 'closed' | 'upcoming' | undefined;
      const category = req.query.category as string;
      const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await tendersService.listTenders({
        page,
        limit,
        status,
        category,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          tenders: result.tenders.map((tender) => ({
            id: tender._id,
            referenceNumber: tender.referenceNumber,
            title: tender.title,
            description: tender.description,
            category: tender.category,
            value: tender.value,
            status: tender.status,
            openingDate: tender.openingDate,
            closingDate: tender.closingDate,
            pdfUrl: tender.pdfUrl,
            published: tender.published,
            createdAt: tender.createdAt,
            updatedAt: tender.updatedAt,
          })),
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
      logger.error('List tenders error:', error);
      next(error);
    }
  }

  /**
   * Get a single tender by ID
   * GET /api/tenders/:id
   */
  async getTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const tender = await tendersService.getTenderById(id);

      res.status(200).json({
        success: true,
        data: {
          tender: {
            id: tender._id,
            referenceNumber: tender.referenceNumber,
            title: tender.title,
            description: tender.description,
            category: tender.category,
            value: tender.value,
            status: tender.status,
            openingDate: tender.openingDate,
            closingDate: tender.closingDate,
            pdfUrl: tender.pdfUrl,
            published: tender.published,
            createdAt: tender.createdAt,
            updatedAt: tender.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get tender error:', error);
      next(error);
    }
  }

  /**
   * Update a tender
   * PUT /api/tenders/:id
   */
  async updateTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        referenceNumber,
        title,
        description,
        category,
        value,
        status,
        openingDate,
        closingDate,
        pdfUrl,
        published,
      } = req.body;

      // Build update object with only provided fields
      const updateData: any = {};
      if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (value !== undefined) {
        if (typeof value !== 'number' || value < 0) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Value must be a non-negative number',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.value = value;
      }
      if (status !== undefined) {
        const validStatuses = ['open', 'closed', 'upcoming'];
        if (!validStatuses.includes(status)) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Status must be one of: open, closed, upcoming',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.status = status;
      }
      if (openingDate !== undefined) {
        const opening = new Date(openingDate);
        if (isNaN(opening.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid opening date format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.openingDate = opening;
      }
      if (closingDate !== undefined) {
        const closing = new Date(closingDate);
        if (isNaN(closing.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid closing date format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.closingDate = closing;
      }
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      if (published !== undefined) updateData.published = published;

      const tender = await tendersService.updateTender(id, updateData);

      logger.info(`Tender updated successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          tender: {
            id: tender._id,
            referenceNumber: tender.referenceNumber,
            title: tender.title,
            description: tender.description,
            category: tender.category,
            value: tender.value,
            status: tender.status,
            openingDate: tender.openingDate,
            closingDate: tender.closingDate,
            pdfUrl: tender.pdfUrl,
            published: tender.published,
            createdAt: tender.createdAt,
            updatedAt: tender.updatedAt,
          },
          message: 'Tender updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update tender error:', error);
      next(error);
    }
  }

  /**
   * Delete a tender
   * DELETE /api/tenders/:id
   */
  async deleteTender(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await tendersService.deleteTender(id);

      logger.info(`Tender deleted: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Tender deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete tender error:', error);
      next(error);
    }
  }
}

export const tendersController = new TendersController();
