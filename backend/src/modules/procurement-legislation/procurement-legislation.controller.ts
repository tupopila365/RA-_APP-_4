import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { procurementLegislationService } from './procurement-legislation.service';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class ProcurementLegislationController {
  /**
   * Create a new procurement legislation document
   * POST /api/procurement-legislation
   */
  async createLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { section, title, documentUrl, documentFileName, published } = req.body;

      if (!section || !title || !documentUrl || !documentFileName) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Section, title, documentUrl, and documentFileName are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const legislation = await procurementLegislationService.createLegislation(
        {
          section,
          title,
          documentUrl,
          documentFileName,
          published: published === true,
        },
        req.user?.userId
      );

      res.status(201).json({
        success: true,
        data: {
          legislation: {
            id: legislation._id,
            section: legislation.section,
            title: legislation.title,
            documentUrl: legislation.documentUrl,
            documentFileName: legislation.documentFileName,
            published: legislation.published,
            publishedAt: legislation.publishedAt,
            createdAt: legislation.createdAt,
            updatedAt: legislation.updatedAt,
          },
          message: 'Procurement legislation created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create procurement legislation error:', error);
      next(error);
    }
  }

  /**
   * List procurement legislation with pagination, filtering, and search
   * GET /api/procurement-legislation
   */
  async listLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const section = req.query.section as string;
      const published =
        req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await procurementLegislationService.listLegislation({
        page,
        limit,
        section: section as 'act' | 'regulations' | 'guidelines' | undefined,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map((item) => ({
            id: item._id,
            section: item.section,
            title: item.title,
            documentUrl: item.documentUrl,
            documentFileName: item.documentFileName,
            published: item.published,
            publishedAt: item.publishedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
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
      logger.error('List procurement legislation error:', error);
      next(error);
    }
  }

  /**
   * Get a single procurement legislation by ID
   * GET /api/procurement-legislation/:id
   */
  async getLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const legislation = await procurementLegislationService.getLegislationById(id);

      res.status(200).json({
        success: true,
        data: {
          legislation: {
            id: legislation._id,
            section: legislation.section,
            title: legislation.title,
            documentUrl: legislation.documentUrl,
            documentFileName: legislation.documentFileName,
            published: legislation.published,
            publishedAt: legislation.publishedAt,
            createdAt: legislation.createdAt,
            updatedAt: legislation.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get procurement legislation error:', error);
      next(error);
    }
  }

  /**
   * Update procurement legislation
   * PUT /api/procurement-legislation/:id
   */
  async updateLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { section, title, documentUrl, documentFileName, published } = req.body;

      const updateData: any = {};
      if (section !== undefined) updateData.section = section;
      if (title !== undefined) updateData.title = title;
      if (documentUrl !== undefined) updateData.documentUrl = documentUrl;
      if (documentFileName !== undefined) updateData.documentFileName = documentFileName;
      if (published !== undefined) updateData.published = published === true;

      const legislation = await procurementLegislationService.updateLegislation(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          legislation: {
            id: legislation._id,
            section: legislation.section,
            title: legislation.title,
            documentUrl: legislation.documentUrl,
            documentFileName: legislation.documentFileName,
            published: legislation.published,
            publishedAt: legislation.publishedAt,
            createdAt: legislation.createdAt,
            updatedAt: legislation.updatedAt,
          },
          message: 'Procurement legislation updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update procurement legislation error:', error);
      next(error);
    }
  }

  /**
   * Delete procurement legislation
   * DELETE /api/procurement-legislation/:id
   */
  async deleteLegislation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Procurement legislation ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await procurementLegislationService.deleteLegislation(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Procurement legislation deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete procurement legislation error:', error);
      next(error);
    }
  }

  /**
   * Bulk upload procurement legislation documents
   * POST /api/procurement-legislation/bulk-upload
   */
  async bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const { section, titles, published } = req.body;

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'No files provided',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (files.length > 10) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Maximum of 10 files allowed per upload',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!section) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Section is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const titleArray = titles ? (Array.isArray(titles) ? titles : [titles]) : [];
      const createdItems = [];
      const errors = [];

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const title = titleArray[i] || file.originalname.replace(/\.[^/.]+$/, '');

          // Upload PDF to Cloudinary
          const uploadResult = await uploadService.uploadPDF(file, {
            userId: req.user?.userId || '',
            email: req.user?.email || '',
          });

          // Create database record
          const legislation = await procurementLegislationService.createLegislation(
            {
              section,
              title,
              documentUrl: uploadResult.url,
              documentFileName: file.originalname,
              published: published === 'true',
            },
            req.user?.userId
          );

          createdItems.push({
            id: legislation._id,
            title: legislation.title,
            documentFileName: legislation.documentFileName,
          });
        } catch (error: any) {
          logger.error(`Error uploading file ${files[i].originalname}:`, error);
          errors.push({
            fileName: files[i].originalname,
            error: error.message || 'Unknown error',
          });
        }
      }

      res.status(201).json({
        success: true,
        data: {
          created: createdItems,
          errors: errors.length > 0 ? errors : undefined,
          message: `Successfully uploaded ${createdItems.length} of ${files.length} files`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Bulk upload procurement legislation error:', error);
      next(error);
    }
  }
}

export const procurementLegislationController = new ProcurementLegislationController();

