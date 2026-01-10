import { ProcurementPlanModel, IProcurementPlan } from './procurement-plan.model';
import {
  CreateProcurementPlanDTO,
  UpdateProcurementPlanDTO,
  ListProcurementPlanQuery,
} from './procurement-plan.dto';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface ListProcurementPlanResult {
  items: IProcurementPlan[];
  total: number;
  page: number;
  totalPages: number;
}

class ProcurementPlanService {
  /**
   * Create a new procurement plan
   */
  async createPlan(dto: CreateProcurementPlanDTO, createdBy?: string): Promise<IProcurementPlan> {
    try {
      logger.info('Creating procurement plan:', { fiscalYear: dto.fiscalYear });

      const plan = await ProcurementPlanModel.create({
        fiscalYear: dto.fiscalYear,
        documentUrl: dto.documentUrl,
        documentFileName: dto.documentFileName,
        published: dto.published || false,
        createdBy,
      });

      logger.info(`Procurement plan created with ID: ${plan._id}`);
      return plan;
    } catch (error: any) {
      logger.error('Create procurement plan error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create procurement plan',
        details: error.message,
      };
    }
  }

  /**
   * List procurement plans with pagination, filtering, and search
   */
  async listPlans(query: ListProcurementPlanQuery): Promise<ListProcurementPlanResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.fiscalYear) {
        filter.fiscalYear = query.fiscalYear;
      }

      if (query.published !== undefined) {
        filter.published = query.published;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Execute query with pagination
      const [items, total] = await Promise.all([
        ProcurementPlanModel.find(filter)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProcurementPlanModel.countDocuments(filter),
      ]);

      return {
        items: items as unknown as IProcurementPlan[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List procurement plans error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement plans',
        details: error.message,
      };
    }
  }

  /**
   * Get a single procurement plan by ID
   */
  async getPlanById(id: string): Promise<IProcurementPlan> {
    try {
      const plan = await ProcurementPlanModel.findById(id).lean();

      if (!plan) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement plan not found',
        };
      }

      return plan as unknown as IProcurementPlan;
    } catch (error: any) {
      logger.error('Get procurement plan error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve procurement plan',
        details: error.message,
      };
    }
  }

  /**
   * Update procurement plan
   */
  async updatePlan(id: string, dto: UpdateProcurementPlanDTO): Promise<IProcurementPlan> {
    try {
      logger.info(`Updating procurement plan: ${id}`);

      const updateData: any = { ...dto };

      // If publishing for the first time, set publishedAt
      if (dto.published === true) {
        const existing = await ProcurementPlanModel.findById(id);
        if (existing && !existing.published && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const plan = await ProcurementPlanModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!plan) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement plan not found',
        };
      }

      logger.info(`Procurement plan ${id} updated successfully`);
      return plan as unknown as IProcurementPlan;
    } catch (error: any) {
      logger.error('Update procurement plan error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update procurement plan',
        details: error.message,
      };
    }
  }

  /**
   * Delete procurement plan
   */
  async deletePlan(id: string): Promise<void> {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        logger.error('Delete called with invalid ID:', id);
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Procurement plan ID is required',
        };
      }

      logger.info(`Deleting procurement plan: ${id}`);

      const plan = await ProcurementPlanModel.findByIdAndDelete(id);

      if (!plan) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Procurement plan not found',
        };
      }

      logger.info(`Procurement plan ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete procurement plan error:', { id, error: error.message });
      if (error.statusCode) {
        throw error;
      }

      if (error.name === 'CastError') {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid procurement plan ID format',
          details: error.message,
        };
      }

      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete procurement plan',
        details: error.message,
      };
    }
  }
}

export const procurementPlanService = new ProcurementPlanService();

