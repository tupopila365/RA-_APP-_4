import { PLNModel, IPLN, PLNStatus, IStatusHistory } from './pln.model';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { CreateApplicationDTO, ListApplicationsQuery, ListApplicationsResult } from './pln.dto';

class PLNService {
  /**
   * Generate unique reference ID
   * Format: PLN{YYYYMMDD}{6digitRandom}
   */
  generateReferenceId(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `PLN${dateStr}${random}`;
  }

  /**
   * Create a new PLN application
   */
  async createApplication(dto: CreateApplicationDTO, file: Express.Multer.File): Promise<IPLN> {
    try {
      logger.info('Creating PLN application:', { fullName: dto.fullName, idNumber: dto.idNumber });

      // Validate plate choices
      if (!dto.plateChoices || dto.plateChoices.length !== 3) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Exactly 3 plate choices are required',
        };
      }

      // Validate each plate choice
      for (let i = 0; i < dto.plateChoices.length; i++) {
        const choice = dto.plateChoices[i];
        if (!choice.text || !choice.text.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Plate choice ${i + 1} text is required`,
          };
        }
        if (choice.text.length > 7) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Plate choice ${i + 1} text cannot exceed 7 characters`,
          };
        }
        if (!/^[a-zA-Z0-9]*$/.test(choice.text)) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Plate choice ${i + 1} text must be alphanumeric only`,
          };
        }
        if (!choice.meaning || !choice.meaning.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Plate choice ${i + 1} meaning is required`,
          };
        }
      }

      // Upload document (PDF or image)
      let documentUrl: string;
      if (file.mimetype === 'application/pdf') {
        const pdfUpload = await uploadService.uploadPDF(file);
        documentUrl = pdfUpload.url;
      } else if (file.mimetype.startsWith('image/')) {
        const imageUpload = await uploadService.uploadImage(file);
        documentUrl = imageUpload.url;
      } else {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Document must be a PDF or image file',
        };
      }

      // Generate unique reference ID
      let referenceId = this.generateReferenceId();
      // Ensure uniqueness (retry if collision)
      let attempts = 0;
      while (attempts < 10) {
        const existing = await PLNModel.findOne({ referenceId });
        if (!existing) break;
        referenceId = this.generateReferenceId();
        attempts++;
      }

      // Create application
      const application = await PLNModel.create({
        referenceId,
        fullName: dto.fullName.trim(),
        idNumber: dto.idNumber.trim(),
        phoneNumber: dto.phoneNumber.trim(),
        plateChoices: dto.plateChoices.map((choice) => ({
          text: choice.text.trim().toUpperCase(),
          meaning: choice.meaning.trim(),
        })),
        documentUrl,
        status: 'SUBMITTED',
        statusHistory: [
          {
            status: 'SUBMITTED',
            changedBy: 'System',
            timestamp: new Date(),
            comment: 'Application submitted',
          },
        ],
      });

      logger.info(`PLN application created with ID: ${application._id}, Reference: ${referenceId}`);
      return application;
    } catch (error: any) {
      logger.error('Create PLN application error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create PLN application',
        details: error.message,
      };
    }
  }

  /**
   * Get application by reference ID and ID number (public tracking)
   */
  async getApplicationByReference(referenceId: string, idNumber: string): Promise<IPLN> {
    try {
      const application = await PLNModel.findOne({
        referenceId: referenceId.trim(),
        idNumber: idNumber.trim(),
      }).lean();

      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found. Please check your reference ID and ID number.',
        };
      }

      return application as unknown as IPLN;
    } catch (error: any) {
      logger.error('Get application by reference error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve application',
        details: error.message,
      };
    }
  }

  /**
   * Get application by ID (admin)
   */
  async getApplicationById(id: string): Promise<IPLN> {
    try {
      const application = await PLNModel.findById(id).lean();

      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      return application as unknown as IPLN;
    } catch (error: any) {
      logger.error('Get application by ID error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve application',
        details: error.message,
      };
    }
  }

  /**
   * List applications with pagination and filtering (admin)
   */
  async listApplications(query: ListApplicationsQuery): Promise<ListApplicationsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.status) {
        filter.status = query.status;
      }

      if (query.search) {
        filter.$or = [
          { referenceId: { $regex: query.search, $options: 'i' } },
          { fullName: { $regex: query.search, $options: 'i' } },
          { idNumber: { $regex: query.search, $options: 'i' } },
          { phoneNumber: { $regex: query.search, $options: 'i' } },
          { 'plateChoices.text': { $regex: query.search, $options: 'i' } },
        ];
      }

      if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
          filter.createdAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filter.createdAt.$lte = new Date(query.endDate);
        }
      }

      // Execute query with pagination
      const [applications, total] = await Promise.all([
        PLNModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PLNModel.countDocuments(filter),
      ]);

      return {
        applications: applications as unknown as IPLN[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List applications error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve applications',
        details: error.message,
      };
    }
  }

  /**
   * Update application status with history logging
   */
  async updateStatus(
    id: string,
    status: PLNStatus,
    adminId: string,
    comment?: string
  ): Promise<IPLN> {
    try {
      logger.info(`Updating application status: ${id} to ${status}`);

      const application = await PLNModel.findById(id);
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      // Add status to history
      const statusHistoryEntry: IStatusHistory = {
        status,
        changedBy: adminId,
        timestamp: new Date(),
        comment,
      };

      const updateData: any = {
        status,
        $push: { statusHistory: statusHistoryEntry },
      };

      // Set payment deadline when approved (21 days from approval)
      if (status === 'APPROVED') {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 21);
        updateData.paymentDeadline = deadline;
        updateData.status = 'PAYMENT_PENDING';
        statusHistoryEntry.status = 'PAYMENT_PENDING';
      }

      const updated = await PLNModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      logger.info(`Application ${id} status updated to ${status}`);
      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Update status error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update status',
        details: error.message,
      };
    }
  }

  /**
   * Mark payment as received
   */
  async markPaymentReceived(id: string, adminId: string): Promise<IPLN> {
    try {
      logger.info(`Marking payment received for application: ${id}`);

      const application = await PLNModel.findById(id);
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      const statusHistoryEntry: IStatusHistory = {
        status: 'PAID',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Payment received',
      };

      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          status: 'PAID',
          paymentReceivedAt: new Date(),
          $push: { statusHistory: statusHistoryEntry },
        },
        { new: true, runValidators: true }
      ).lean();

      logger.info(`Payment marked as received for application ${id}`);
      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Mark payment received error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to mark payment as received',
        details: error.message,
      };
    }
  }

  /**
   * Order plates (update status to PLATES_ORDERED)
   */
  async orderPlates(id: string, adminId: string): Promise<IPLN> {
    try {
      logger.info(`Ordering plates for application: ${id}`);

      const statusHistoryEntry: IStatusHistory = {
        status: 'PLATES_ORDERED',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Plates ordered for manufacturing',
      };

      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          status: 'PLATES_ORDERED',
          $push: { statusHistory: statusHistoryEntry },
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      logger.info(`Plates ordered for application ${id}`);
      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Order plates error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to order plates',
        details: error.message,
      };
    }
  }

  /**
   * Mark ready for collection
   */
  async markReadyForCollection(id: string, adminId: string): Promise<IPLN> {
    try {
      logger.info(`Marking application ready for collection: ${id}`);

      const statusHistoryEntry: IStatusHistory = {
        status: 'READY_FOR_COLLECTION',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Plates ready for collection',
      };

      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          status: 'READY_FOR_COLLECTION',
          $push: { statusHistory: statusHistoryEntry },
        },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      logger.info(`Application ${id} marked as ready for collection`);
      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Mark ready for collection error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to mark as ready for collection',
        details: error.message,
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<PLNStatus, number>;
  }> {
    try {
      const [total, statusCounts] = await Promise.all([
        PLNModel.countDocuments(),
        PLNModel.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const byStatus: Record<PLNStatus, number> = {
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        DECLINED: 0,
        PAYMENT_PENDING: 0,
        PAID: 0,
        PLATES_ORDERED: 0,
        READY_FOR_COLLECTION: 0,
        EXPIRED: 0,
      };

      statusCounts.forEach((item) => {
        byStatus[item._id as PLNStatus] = item.count;
      });

      return { total, byStatus };
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve dashboard statistics',
        details: error.message,
      };
    }
  }
}

export const plnService = new PLNService();


