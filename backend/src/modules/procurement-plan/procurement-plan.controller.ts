import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { procurementPlanService } from './procurement-plan.service';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class ProcurementPlanController {
  /**
   * Create a new procurement plan
   * POST /api/procurement-plan
   */
  async createPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fiscalYear, documentUrl, documentFileName, published } = req.body;

      if (!fiscalYear || !documentUrl || !documentFileName) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'FiscalYear, documentUrl, and documentFileName are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const plan = await procurementPlanService.createPlan(
        {
          fiscalYear,
          documentUrl,
          documentFileName,
          published: published === true,
        },
        req.user?.userId
      );

      res.status(201).json({
        success: true,
        data: {
          plan: {
            id: plan._id,
            fiscalYear: plan.fiscalYear,
            documentUrl: plan.documentUrl,
            documentFileName: plan.documentFileName,
            published: plan.published,
            publishedAt: plan.publishedAt,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
          },
          message: 'Procurement plan created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create procurement plan error:', error);
      next(error);
    }
  }

  /**
   * List procurement plans with pagination, filtering, and search
   * GET /api/procurement-plan
   */
  async listPlans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const fiscalYear = req.query.fiscalYear as string;
      const published =
        req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await procurementPlanService.listPlans({
        page,
        limit,
        fiscalYear,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map((item) => ({
            id: item._id,
            fiscalYear: item.fiscalYear,
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
      logger.error('List procurement plans error:', error);
      next(error);
    }
  }

  /**
   * Get a single procurement plan by ID
   * GET /api/procurement-plan/:id
   */
  async getPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await procurementPlanService.getPlanById(id);

      res.status(200).json({
        success: true,
        data: {
          plan: {
            id: plan._id,
            fiscalYear: plan.fiscalYear,
            documentUrl: plan.documentUrl,
            documentFileName: plan.documentFileName,
            published: plan.published,
            publishedAt: plan.publishedAt,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get procurement plan error:', error);
      next(error);
    }
  }

  /**
   * Update procurement plan
   * PUT /api/procurement-plan/:id
   */
  async updatePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { fiscalYear, documentUrl, documentFileName, published } = req.body;

      const updateData: any = {};
      if (fiscalYear !== undefined) updateData.fiscalYear = fiscalYear;
      if (documentUrl !== undefined) updateData.documentUrl = documentUrl;
      if (documentFileName !== undefined) updateData.documentFileName = documentFileName;
      if (published !== undefined) updateData.published = published === true;

      const plan = await procurementPlanService.updatePlan(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          plan: {
            id: plan._id,
            fiscalYear: plan.fiscalYear,
            documentUrl: plan.documentUrl,
            documentFileName: plan.documentFileName,
            published: plan.published,
            publishedAt: plan.publishedAt,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
          },
          message: 'Procurement plan updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update procurement plan error:', error);
      next(error);
    }
  }

  /**
   * Delete procurement plan
   * DELETE /api/procurement-plan/:id
   */
  async deletePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Procurement plan ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await procurementPlanService.deletePlan(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Procurement plan deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete procurement plan error:', error);
      next(error);
    }
  }

  /**
   * Bulk upload procurement plans
   * POST /api/procurement-plan/bulk-upload
   */
  async bulkUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const { fiscalYears, published } = req.body;

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

      const fiscalYearArray = fiscalYears
        ? Array.isArray(fiscalYears)
          ? fiscalYears
          : [fiscalYears]
        : [];
      const createdItems = [];
      const errors = [];

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const fiscalYear =
            fiscalYearArray[i] || file.originalname.replace(/\.[^/.]+$/, '').trim();

          // Upload PDF to Cloudinary
          const uploadResult = await uploadService.uploadPDF(file, {
            userId: req.user?.userId || '',
            email: req.user?.email || '',
          });

          // Create database record
          const plan = await procurementPlanService.createPlan(
            {
              fiscalYear,
              documentUrl: uploadResult.url,
              documentFileName: file.originalname,
              published: published === 'true',
            },
            req.user?.userId
          );

          createdItems.push({
            id: plan._id,
            fiscalYear: plan.fiscalYear,
            documentFileName: plan.documentFileName,
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
      logger.error('Bulk upload procurement plan error:', error);
      next(error);
    }
  }
}

export const procurementPlanController = new ProcurementPlanController();

