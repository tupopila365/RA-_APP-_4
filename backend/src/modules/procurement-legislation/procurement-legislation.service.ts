import {
  ProcurementLegislationModel,
  IProcurementLegislation,
} from './procurement-legislation.model';
import {
  CreateProcurementLegislationDTO,
  UpdateProcurementLegislationDTO,
  ListProcurementLegislationQuery,
} from './procurement-legislation.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface ListProcurementLegislationResult {
  items: IProcurementLegislation[];
  total: number;
  page: number;
  totalPages: number;
}

class ProcurementLegislationService {
  /**
   * Create a new procurement legislation document
   */
  async createLegislation(
    dto: CreateProcurementLegislationDTO,
    createdBy?: string
  ): Promise<IProcurementLegislation> {
    try {
      logger.info('Creating procurement legislation:', { title: dto.title, section: dto.section });

      const legislation = await ProcurementLegislationModel.create({
        section: dto.section,
        title: dto.title,
        documentUrl: dto.documentUrl,
        documentFileName: dto.documentFileName,
        published: dto.published || false,
        createdBy,
      });

      logger.info(`Procurement legislation created with ID: ${legislation._id}`);
      return legislation;
    } catch (error: any) {
      logger.error('Create procurement legislation error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create procurement legislation',
        details: error.message,
      };
    }
  }

  /**
   * List procurement legislation with pagination, filtering, and search
   */
  async listLegislation(query: ListProcurementLegislationQuery): Promise<ListProcurementLegislationResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.section) {
        filter.section = query.section;
      }

      if (query.published !== undefined) {
        filter.published = query.published;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [items, total] = await Promise.all([
        ProcurementLegislationModel.find(filter)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcurementLegislationModel.countDocuments(filter),
      ]);

      return {
        items: items as unknown as IProcurementLegislation[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List procurement legislation error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement legislation',
        details: error.message,
      };
    }
  }

  /**
   * Get a single procurement legislation by ID
   */
  async getLegislationById(id: string): Promise<IProcurementLegislation> {
    try {
      const legislation = await ProcurementLegislationModel.findById(id).lean();

      if (!legislation) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      return legislation as unknown as IProcurementLegislation;
    } catch (error: any) {
      logger.error('Get procurement legislation error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement legislation',
        details: error.message,
      };
    }
  }

  /**
   * Update procurement legislation
   */
  async updateLegislation(
    id: string,
    dto: UpdateProcurementLegislationDTO
  ): Promise<IProcurementLegislation> {
    try {
      logger.info(`Updating procurement legislation: ${id}`);

      const updateData: any = { ...dto };

      // If publishing for the first time, set publishedAt
      if (dto.published === true) {
        const existing = await ProcurementLegislationModel.findById(id);
        if (existing && !existing.published && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const legislation = await ProcurementLegislationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!legislation) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      logger.info(`Procurement legislation ${id} updated successfully`);
      return legislation as unknown as IProcurementLegislation;
    } catch (error: any) {
      logger.error('Update procurement legislation error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update procurement legislation',
        details: error.message,
      };
    }
  }

  /**
   * Delete procurement legislation
   */
  async deleteLegislation(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        logger.error('Delete called with invalid ID:', id);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement legislation ID is required',
        };
      }

      logger.info(`Deleting procurement legislation: ${id}`);

      const legislation = await ProcurementLegislationModel.findByIdAndDelete(id);

      if (!legislation) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement legislation not found',
        };
      }

      logger.info(`Procurement legislation ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete procurement legislation error:', { id, error: error.message });
      if (error.statusCode) {
        throw error;
      }

      if (error.name === 'CastError') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid procurement legislation ID format',
          details: error.message,
        };
      }

      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete procurement legislation',
        details: error.message,
      };
    }
  }
}

export const procurementLegislationService = new ProcurementLegislationService();

