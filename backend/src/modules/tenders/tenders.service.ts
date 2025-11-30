import { TenderModel, ITender } from './tenders.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateTenderDTO {
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: 'open' | 'closed' | 'upcoming';
  openingDate: Date;
  closingDate: Date;
  pdfUrl: string;
  published?: boolean;
}

export interface UpdateTenderDTO {
  referenceNumber?: string;
  title?: string;
  description?: string;
  category?: string;
  value?: number;
  status?: 'open' | 'closed' | 'upcoming';
  openingDate?: Date;
  closingDate?: Date;
  pdfUrl?: string;
  published?: boolean;
}

export interface ListTendersQuery {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | 'upcoming';
  category?: string;
  published?: boolean;
  search?: string;
}

export interface ListTendersResult {
  tenders: ITender[];
  total: number;
  page: number;
  totalPages: number;
}

class TendersService {
  /**
   * Create a new tender
   */
  async createTender(dto: CreateTenderDTO): Promise<ITender> {
    try {
      logger.info('Creating tender:', { referenceNumber: dto.referenceNumber, title: dto.title });

      const tender = await TenderModel.create({
        referenceNumber: dto.referenceNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        value: dto.value,
        status: dto.status,
        openingDate: dto.openingDate,
        closingDate: dto.closingDate,
        pdfUrl: dto.pdfUrl,
        published: dto.published || false,
      });

      logger.info(`Tender created with ID: ${tender._id}`);
      return tender;
    } catch (error: any) {
      logger.error('Create tender error:', error);
      
      // Handle duplicate reference number
      if (error.code === 11000) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'A tender with this reference number already exists',
          details: error.message,
        };
      }
      
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create tender',
        details: error.message,
      };
    }
  }

  /**
   * List tenders with pagination, filtering, and search
   */
  async listTenders(query: ListTendersQuery): Promise<ListTendersResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.status) {
        filter.status = query.status;
      }

      if (query.category) {
        filter.category = query.category;
      }

      if (query.published !== undefined) {
        filter.published = query.published;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [tenders, total] = await Promise.all([
        TenderModel.find(filter)
          .sort({ closingDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        TenderModel.countDocuments(filter),
      ]);

      return {
        tenders: tenders as unknown as ITender[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List tenders error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve tenders',
        details: error.message,
      };
    }
  }

  /**
   * Get a single tender by ID
   */
  async getTenderById(tenderId: string): Promise<ITender> {
    try {
      const tender = await TenderModel.findById(tenderId).lean();

      if (!tender) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tender not found',
        };
      }

      return tender as unknown as ITender;
    } catch (error: any) {
      logger.error('Get tender error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve tender',
        details: error.message,
      };
    }
  }

  /**
   * Update a tender
   */
  async updateTender(tenderId: string, dto: UpdateTenderDTO): Promise<ITender> {
    try {
      logger.info(`Updating tender: ${tenderId}`);

      const tender = await TenderModel.findByIdAndUpdate(
        tenderId,
        dto,
        { new: true, runValidators: true }
      ).lean();

      if (!tender) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tender not found',
        };
      }

      logger.info(`Tender ${tenderId} updated successfully`);
      return tender as unknown as ITender;
    } catch (error: any) {
      logger.error('Update tender error:', error);
      
      // Handle duplicate reference number
      if (error.code === 11000) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'A tender with this reference number already exists',
          details: error.message,
        };
      }
      
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update tender',
        details: error.message,
      };
    }
  }

  /**
   * Delete a tender
   */
  async deleteTender(tenderId: string): Promise<void> {
    try {
      logger.info(`Deleting tender: ${tenderId}`);

      const tender = await TenderModel.findByIdAndDelete(tenderId);

      if (!tender) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Tender not found',
        };
      }

      logger.info(`Tender ${tenderId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete tender error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete tender',
        details: error.message,
      };
    }
  }
}

export const tendersService = new TendersService();
