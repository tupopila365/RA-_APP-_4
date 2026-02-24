import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { formService } from './forms.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

function toFormItem(item: { id: number; title: string; description: string | null; category: string; pdfUrl: string; published: boolean; createdAt: Date; updatedAt: Date }) {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? '',
    category: item.category,
    pdfUrl: item.pdfUrl,
    published: item.published,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export class FormController {
  /**
   * Create a new form/download
   * POST /api/forms
   */
  async createForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, category, pdfUrl, published } = req.body;

      if (!title || !category || !pdfUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Title, category, and PDF URL are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const form = await formService.create({
        title,
        description: description || null,
        category,
        pdfUrl,
        published: published === true,
      });

      res.status(201).json({
        success: true,
        data: { form: toFormItem(form), message: 'Form created successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create form error:', error);
      next(error);
    }
  }

  /**
   * List forms – app uses ?published=true to get only published items
   * GET /api/forms
   */
  async listForms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = (req.query.category as string) || undefined;
      const published =
        req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = (req.query.search as string) || undefined;

      const result = await formService.list({
        page,
        limit,
        category,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map(toFormItem),
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
      logger.error('List forms error:', error);
      next(error);
    }
  }

  /**
   * Get a single form by ID
   * GET /api/forms/:id
   */
  async getForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const form = await formService.getById(id);
      res.status(200).json({
        success: true,
        data: { form: toFormItem(form) },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get form error:', error);
      next(error);
    }
  }

  /**
   * Update form
   * PUT /api/forms/:id
   */
  async updateForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, category, pdfUrl, published } = req.body;

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      if (published !== undefined) updateData.published = published === true;

      const form = await formService.update(id, updateData as any);
      res.status(200).json({
        success: true,
        data: { form: toFormItem(form), message: 'Form updated successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update form error:', error);
      next(error);
    }
  }

  /**
   * Delete form
   * DELETE /api/forms/:id
   */
  async deleteForm(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Form ID is required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      await formService.delete(id);
      res.status(200).json({
        success: true,
        data: { message: 'Form deleted successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete form error:', error);
      next(error);
    }
  }
}

export const formController = new FormController();
