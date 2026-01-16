import { PLNModel, IPLN, PLNStatus, IStatusHistory } from './pln.model';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { CreateApplicationDTO, ListApplicationsQuery, ListApplicationsResult } from './pln.dto';
import { SecureIdGenerator } from '../../utils/secureIdGenerator';

class PLNService {
  /**
   * Generate unique reference ID using secure random generation
   * Format: PLN-{YYYY}-{SecureRandom12}
   */
  generateReferenceId(): string {
    return SecureIdGenerator.generatePLNReferenceId();
  }

  /**
   * Generate tracking PIN (simple for now - everyone gets 12345)
   */
  generateTrackingPin(): string {
    return '12345';
  }

  /**
   * Create a new PLN application
   */
  async createApplication(dto: CreateApplicationDTO, file: Express.Multer.File): Promise<IPLN> {
    try {
      // Check if using new structure or legacy structure
      const isNewStructure = dto.idType && dto.surname && dto.postalAddress;

      if (isNewStructure) {
        logger.info('Creating PLN application (new structure):', {
          surname: dto.surname,
          idType: dto.idType,
        });
      } else {
        logger.info('Creating PLN application (legacy structure):', {
          fullName: dto.fullName,
          idNumber: dto.idNumber,
        });
      }

      // Validate required fields based on structure
      if (isNewStructure) {
        // New structure validation
        if (!dto.idType) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'ID type is required',
          };
        }

        if (!dto.surname || !dto.surname.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Surname is required',
          };
        }

        if (!dto.initials || !dto.initials.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Initials are required',
          };
        }

        // Validate ID number based on type
        if (dto.idType === 'Traffic Register Number' || dto.idType === 'Namibia ID-doc') {
          if (!dto.trafficRegisterNumber || !dto.trafficRegisterNumber.trim()) {
            throw {
              statusCode: 400,
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Traffic Register Number or Namibia ID-doc number is required',
            };
          }
        } else if (dto.idType === 'Business Reg. No') {
          if (!dto.businessRegNumber || !dto.businessRegNumber.trim()) {
            throw {
              statusCode: 400,
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Business Registration Number is required',
            };
          }
          if (!dto.businessName || !dto.businessName.trim()) {
            throw {
              statusCode: 400,
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Business name is required for business registrations',
            };
          }
        }

        // Validate addresses
        if (!dto.postalAddress || !dto.postalAddress.line1 || !dto.postalAddress.line1.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Postal address line 1 is required',
          };
        }

        if (!dto.streetAddress || !dto.streetAddress.line1 || !dto.streetAddress.line1.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Street address line 1 is required',
          };
        }

        // Validate at least one contact method
        if (
          !dto.cellNumber &&
          !dto.telephoneDay &&
          !dto.telephoneHome &&
          (!dto.email || !dto.email.trim())
        ) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'At least one contact method (cell number, telephone, or email) is required',
          };
        }

        // Validate declaration
        if (!dto.declarationAccepted) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Declaration must be accepted',
          };
        }

        if (!dto.declarationPlace || !dto.declarationPlace.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Declaration place is required',
          };
        }
      } else {
        // Legacy structure validation
        if (!dto.fullName || !dto.fullName.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Full name is required',
          };
        }

        if (!dto.idNumber || !dto.idNumber.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'ID number is required',
          };
        }

        if (!dto.phoneNumber || !dto.phoneNumber.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Phone number is required',
          };
        }
      }

      // Validate plate choices (common for both structures)
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
        if (choice.text.length > 8) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: `Plate choice ${i + 1} text cannot exceed 8 characters`,
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

      // Validate plate format and quantity (new structure)
      if (isNewStructure) {
        if (!dto.plateFormat) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Plate format is required',
          };
        }

        if (!dto.quantity || (dto.quantity !== 1 && dto.quantity !== 2)) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Quantity must be 1 or 2',
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

      // Build application data
      const applicationData: any = {
        referenceId,
        trackingPin: this.generateTrackingPin(),
        transactionType: 'New Personalised Licence Number',
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
      };

      if (isNewStructure) {
        // New structure
        applicationData.idType = dto.idType;
        applicationData.surname = dto.surname.trim();
        applicationData.initials = dto.initials.trim();
        applicationData.postalAddress = {
          line1: dto.postalAddress.line1.trim(),
          line2: dto.postalAddress.line2?.trim(),
          line3: dto.postalAddress.line3?.trim(),
        };
        applicationData.streetAddress = {
          line1: dto.streetAddress.line1.trim(),
          line2: dto.streetAddress.line2?.trim(),
          line3: dto.streetAddress.line3?.trim(),
        };
        applicationData.plateFormat = dto.plateFormat;
        applicationData.quantity = dto.quantity;
        applicationData.declarationAccepted = dto.declarationAccepted;
        applicationData.declarationDate = new Date();
        applicationData.declarationPlace = dto.declarationPlace.trim();
        applicationData.declarationRole = dto.declarationRole || 'applicant';

        if (dto.idType === 'Traffic Register Number' || dto.idType === 'Namibia ID-doc') {
          applicationData.trafficRegisterNumber = dto.trafficRegisterNumber?.trim();
        } else if (dto.idType === 'Business Reg. No') {
          applicationData.businessRegNumber = dto.businessRegNumber?.trim();
          applicationData.businessName = dto.businessName?.trim();
        }

        if (dto.telephoneHome) {
          applicationData.telephoneHome = {
            code: dto.telephoneHome.code.trim(),
            number: dto.telephoneHome.number.trim(),
          };
        }

        if (dto.telephoneDay) {
          applicationData.telephoneDay = {
            code: dto.telephoneDay.code.trim(),
            number: dto.telephoneDay.number.trim(),
          };
        }

        if (dto.cellNumber) {
          applicationData.cellNumber = {
            code: dto.cellNumber.code.trim(),
            number: dto.cellNumber.number.trim(),
          };
        }

        if (dto.email) {
          applicationData.email = dto.email.trim().toLowerCase();
        }

        // Optional sections
        if (dto.hasRepresentative) {
          applicationData.hasRepresentative = true;
          applicationData.representativeIdType = dto.representativeIdType;
          applicationData.representativeIdNumber = dto.representativeIdNumber?.trim();
          applicationData.representativeSurname = dto.representativeSurname?.trim();
          applicationData.representativeInitials = dto.representativeInitials?.trim();
        }

        if (
          dto.currentLicenceNumber ||
          dto.vehicleRegisterNumber ||
          dto.chassisNumber ||
          dto.vehicleMake ||
          dto.seriesName
        ) {
          applicationData.hasVehicle = true;
          if (dto.currentLicenceNumber) {
            applicationData.currentLicenceNumber = dto.currentLicenceNumber.trim();
          }
          if (dto.vehicleRegisterNumber) {
            applicationData.vehicleRegisterNumber = dto.vehicleRegisterNumber.trim();
          }
          if (dto.chassisNumber) {
            applicationData.chassisNumber = dto.chassisNumber.trim();
          }
          if (dto.vehicleMake) {
            applicationData.vehicleMake = dto.vehicleMake.trim();
          }
          if (dto.seriesName) {
            applicationData.seriesName = dto.seriesName.trim();
          }
        }
      } else {
        // Legacy structure - convert to new structure
        applicationData.fullName = dto.fullName?.trim() || '';
        applicationData.idNumber = dto.idNumber?.trim() || '';
        applicationData.phoneNumber = dto.phoneNumber?.trim() || '';
        // Default values for new fields
        applicationData.idType = 'Namibia ID-doc';
        applicationData.surname = dto.fullName?.split(' ')[0] || dto.fullName || '';
        applicationData.initials = dto.fullName?.split(' ').slice(1).join(' ').substring(0, 10) || '';
        applicationData.trafficRegisterNumber = dto.idNumber?.trim() || '';
        applicationData.postalAddress = { line1: 'Not provided' };
        applicationData.streetAddress = { line1: 'Not provided' };
        applicationData.plateFormat = 'Normal';
        applicationData.quantity = 1;
        applicationData.declarationAccepted = true;
        applicationData.declarationDate = new Date();
        applicationData.declarationPlace = 'Mobile App';
        applicationData.declarationRole = 'applicant';
        // Parse phone number
        const phoneMatch = dto.phoneNumber?.match(/^(\+?264|0)?(\d+)$/);
        if (phoneMatch) {
          applicationData.cellNumber = {
            code: phoneMatch[1] || '264',
            number: phoneMatch[2] || dto.phoneNumber || '',
          };
        }
      }

      // Create application
      const application = await PLNModel.create(applicationData);

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
   * Get application by reference ID and PIN (public tracking)
   * Universal PIN: 12345 for all users
   */
  async getApplicationByReference(referenceId: string, pin: string): Promise<IPLN> {
    try {
      // Validate universal PIN
      const UNIVERSAL_PIN = '12345';
      if (pin.trim() !== UNIVERSAL_PIN) {
        throw {
          statusCode: 401,
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'Invalid PIN. Please check your PIN and try again.',
        };
      }

      // Find application by reference ID (case-insensitive)
      const application = await PLNModel.findOne({
        referenceId: { $regex: new RegExp(`^${referenceId.trim()}$`, 'i') },
      }).lean();

      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found. Please check your reference ID.',
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
          { surname: { $regex: query.search, $options: 'i' } },
          { businessName: { $regex: query.search, $options: 'i' } },
          { idNumber: { $regex: query.search, $options: 'i' } },
          { trafficRegisterNumber: { $regex: query.search, $options: 'i' } },
          { businessRegNumber: { $regex: query.search, $options: 'i' } },
          { phoneNumber: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
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
    recentApplications: IPLN[];
    paymentOverdue: number;
    monthlyStats: { month: string; count: number }[];
  }> {
    try {
      const [total, statusCounts, recentApplications, paymentOverdue, monthlyStats] = await Promise.all([
        PLNModel.countDocuments(),
        PLNModel.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        PLNModel.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        PLNModel.countDocuments({
          status: 'PAYMENT_PENDING',
          paymentDeadline: { $lt: new Date() },
        }),
        PLNModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1 },
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

      const monthlyStatsFormatted = monthlyStats.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count,
      }));

      return {
        total,
        byStatus,
        recentApplications: recentApplications as unknown as IPLN[],
        paymentOverdue,
        monthlyStats: monthlyStatsFormatted,
      };
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

  /**
   * Update admin comments
   */
  async updateAdminComments(id: string, comments: string, adminId: string): Promise<IPLN> {
    try {
      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          adminComments: comments,
          $push: {
            statusHistory: {
              status: 'UNDER_REVIEW',
              changedBy: adminId,
              timestamp: new Date(),
              comment: 'Admin comments updated',
            },
          },
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

      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Update admin comments error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update admin comments',
        details: error.message,
      };
    }
  }

  /**
   * Assign application to admin
   */
  async assignToAdmin(id: string, assignedTo: string, adminId: string): Promise<IPLN> {
    try {
      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          assignedTo,
          $push: {
            statusHistory: {
              status: 'UNDER_REVIEW',
              changedBy: adminId,
              timestamp: new Date(),
              comment: `Application assigned to ${assignedTo}`,
            },
          },
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

      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Assign to admin error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to assign application',
        details: error.message,
      };
    }
  }

  /**
   * Set application priority
   */
  async setPriority(id: string, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT', adminId: string): Promise<IPLN> {
    try {
      const updated = await PLNModel.findByIdAndUpdate(
        id,
        {
          priority,
          $push: {
            statusHistory: {
              status: 'UNDER_REVIEW',
              changedBy: adminId,
              timestamp: new Date(),
              comment: `Priority set to ${priority}`,
            },
          },
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

      return updated as unknown as IPLN;
    } catch (error: any) {
      logger.error('Set priority error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to set priority',
        details: error.message,
      };
    }
  }
}

export const plnService = new PLNService();



