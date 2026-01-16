import { FormModel, IForm } from './forms.model';
import { logger } from '../../utils/logger';
import { AppError } from '../../middlewares/errorHandler';
import { ERROR_CODES } from '../../constants/errors';

export class FormService {
  /**
   * Create a new form
   */
  async createForm(
    data: {
      name: string;
      category: string;
      documents: Array<{ title: string; url: string; fileName: string }>;
      published?: boolean;
    },
    userId?: string
  ): Promise<IForm> {
    try {
      const form = new FormModel({
        ...data,
        createdBy: userId,
      });

      await form.save();
      logger.info(`Form created: ${form._id}`);
      return form;
    } catch (error: any) {
      logger.error('Create form error:', error);
      if (error.code === 11000) {
        throw new AppError('Form with this name already exists', 409, ERROR_CODES.DUPLICATE_ENTRY);
      }
      throw error;
    }
  }

  /**
   * List forms with pagination and filtering
   */
  async listForms(options: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    search?: string;
  }): Promise<{
    items: IForm[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (options.category) {
        query.category = options.category;
      }

      if (options.published !== undefined) {
        query.published = options.published;
      }

      if (options.search) {
        query.$text = { $search: options.search };
      }

      const [items, total] = await Promise.all([
        FormModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FormModel.countDocuments(query),
      ]);

      return {
        items: items as IForm[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List forms error:', error);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(id: string): Promise<IForm> {
    try {
      const form = await FormModel.findById(id);
      if (!form) {
        throw new AppError('Form not found', 404, ERROR_CODES.NOT_FOUND);
      }
      return form;
    } catch (error: any) {
      logger.error('Get form error:', error);
      if (error.name === 'CastError') {
        throw new AppError('Invalid form ID', 400, ERROR_CODES.VALIDATION_ERROR);
      }
      throw error;
    }
  }

  /**
   * Update form
   */
  async updateForm(id: string, data: Partial<IForm>): Promise<IForm> {
    try {
      const form = await FormModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!form) {
        throw new AppError('Form not found', 404, ERROR_CODES.NOT_FOUND);
      }

      logger.info(`Form updated: ${id}`);
      return form;
    } catch (error: any) {
      logger.error('Update form error:', error);
      if (error.name === 'CastError') {
        throw new AppError('Invalid form ID', 400, ERROR_CODES.VALIDATION_ERROR);
      }
      if (error.code === 11000) {
        throw new AppError('Form with this name already exists', 409, ERROR_CODES.DUPLICATE_ENTRY);
      }
      throw error;
    }
  }

  /**
   * Delete form
   */
  async deleteForm(id: string): Promise<void> {
    try {
      const form = await FormModel.findByIdAndDelete(id);
      if (!form) {
        throw new AppError('Form not found', 404, ERROR_CODES.NOT_FOUND);
      }
      logger.info(`Form deleted: ${id}`);
    } catch (error: any) {
      logger.error('Delete form error:', error);
      if (error.name === 'CastError') {
        throw new AppError('Invalid form ID', 400, ERROR_CODES.VALIDATION_ERROR);
      }
      throw error;
    }
  }
}

export const formService = new FormService();
