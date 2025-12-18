import { FAQModel, IFAQ } from './faqs.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateFAQDTO {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface UpdateFAQDTO {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
}

export interface ListFAQsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface ListFAQsResult {
  faqs: IFAQ[];
  total: number;
  page: number;
  totalPages: number;
}

class FAQService {
  /**
   * Create a new FAQ
   */
  async createFAQ(dto: CreateFAQDTO): Promise<IFAQ> {
    try {
      logger.info('Creating FAQ:', { question: dto.question });

      const faq = await FAQModel.create({
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        order: dto.order || 0,
      });

      logger.info(`FAQ created with ID: ${faq._id}`);
      return faq;
    } catch (error: any) {
      logger.error('Create FAQ error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create FAQ',
        details: error.message,
      };
    }
  }

  /**
   * List FAQs with pagination, filtering, and search
   */
  async listFAQs(query: ListFAQsQuery): Promise<ListFAQsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.category) {
        filter.category = query.category;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [faqs, total] = await Promise.all([
        FAQModel.find(filter)
          .sort({ order: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FAQModel.countDocuments(filter),
      ]);

      return {
        faqs: faqs as unknown as IFAQ[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List FAQs error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve FAQs',
        details: error.message,
      };
    }
  }

  /**
   * Get a single FAQ by ID
   */
  async getFAQById(faqId: string): Promise<IFAQ> {
    try {
      const faq = await FAQModel.findById(faqId).lean();

      if (!faq) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'FAQ not found',
        };
      }

      return faq as unknown as IFAQ;
    } catch (error: any) {
      logger.error('Get FAQ error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve FAQ',
        details: error.message,
      };
    }
  }

  /**
   * Update a FAQ
   */
  async updateFAQ(faqId: string, dto: UpdateFAQDTO): Promise<IFAQ> {
    try {
      logger.info(`Updating FAQ: ${faqId}`);

      const faq = await FAQModel.findByIdAndUpdate(
        faqId,
        dto,
        { new: true, runValidators: true }
      ).lean();

      if (!faq) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'FAQ not found',
        };
      }

      logger.info(`FAQ ${faqId} updated successfully`);
      return faq as unknown as IFAQ;
    } catch (error: any) {
      logger.error('Update FAQ error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update FAQ',
        details: error.message,
      };
    }
  }

  /**
   * Delete a FAQ
   */
  async deleteFAQ(faqId: string): Promise<void> {
    try {
      // Validate ID is provided
      if (!faqId || faqId === 'undefined' || faqId === 'null') {
        logger.error('Delete called with invalid ID:', faqId);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'FAQ ID is required',
        };
      }

      logger.info(`Deleting FAQ: ${faqId}`);

      const faq = await FAQModel.findByIdAndDelete(faqId);

      if (!faq) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'FAQ not found',
        };
      }

      logger.info(`FAQ ${faqId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete FAQ error:', { faqId, error: error.message });
      if (error.statusCode) {
        throw error;
      }
      
      // Handle Mongoose CastError (invalid ObjectId format)
      if (error.name === 'CastError') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid FAQ ID format',
          details: error.message,
        };
      }
      
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete FAQ',
        details: error.message,
      };
    }
  }
}

export const faqsService = new FAQService();

