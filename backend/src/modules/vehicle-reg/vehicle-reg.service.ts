import { VehicleRegModel, IVehicleReg, VehicleRegStatus, IStatusHistory } from './vehicle-reg.model';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { CreateVehicleRegDTO, ListApplicationsQuery, ListApplicationsResult } from './vehicle-reg.dto';
import { SecureIdGenerator } from '../../utils/secureIdGenerator';

class VehicleRegService {
  /**
   * Generate unique reference ID using secure random generation
   * Format: VREG-{YYYY}-{SecureRandom12}
   */
  generateReferenceId(): string {
    return SecureIdGenerator.generateVehicleRegReferenceId();
  }

  /**
   * Generate tracking PIN (simple for now - everyone gets 12345)
   */
  generateTrackingPin(): string {
    return '12345';
  }

  /**
   * Create a new vehicle registration application
   */
  async createApplication(dto: CreateVehicleRegDTO, file: Express.Multer.File): Promise<IVehicleReg> {
    try {
      logger.info('Creating vehicle registration application:', {
        make: dto.make,
        idType: dto.idType,
        applicationType: dto.applicationType,
      });

      // Validate required fields
      if (!dto.idType) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'ID type is required',
        };
      }

      if (!dto.identificationNumber || !dto.identificationNumber.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Identification number is required',
        };
      }

      // Validate name fields based on person type
      if (dto.idType === 'Business Reg. No') {
        if (!dto.businessName || !dto.businessName.trim()) {
          throw {
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Business name is required for business registrations',
          };
        }
      } else {
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

      // Validate vehicle fields
      if (!dto.make || !dto.make.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Vehicle make is required',
        };
      }

      if (!dto.seriesName || !dto.seriesName.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Series name is required',
        };
      }

      if (!dto.drivenType) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Driven type is required',
        };
      }

      if (!dto.fuelType) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Fuel type is required',
        };
      }

      if (!dto.transmission) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Transmission is required',
        };
      }

      if (!dto.mainColour) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Main colour is required',
        };
      }

      if (!dto.ownershipType) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Ownership type is required',
        };
      }

      // Validate payment (must be exactly 150 NAD and have a reference)
      if (dto.paymentAmount === undefined || dto.paymentAmount === null) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Payment amount is required',
        };
      }

      if (Number(dto.paymentAmount) !== 150) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Application fee must be exactly NAD 150',
        };
      }

      if (!dto.paymentReference || !dto.paymentReference.trim()) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Payment reference is required',
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
        const existing = await VehicleRegModel.findOne({ referenceId });
        if (!existing) break;
        referenceId = this.generateReferenceId();
        attempts++;
      }

      // Build application data
      const applicationData: any = {
        referenceId,
        trackingPin: this.generateTrackingPin(),
        idType: dto.idType,
        identificationNumber: dto.identificationNumber.trim(),
        postalAddress: {
          line1: dto.postalAddress.line1.trim(),
          line2: dto.postalAddress.line2?.trim(),
          line3: dto.postalAddress.line3?.trim(),
        },
        streetAddress: {
          line1: dto.streetAddress.line1.trim(),
          line2: dto.streetAddress.line2?.trim(),
          line3: dto.streetAddress.line3?.trim(),
        },
        make: dto.make.trim(),
        seriesName: dto.seriesName.trim(),
        drivenType: dto.drivenType,
        fuelType: dto.fuelType,
        transmission: dto.transmission,
        mainColour: dto.mainColour,
        ownershipType: dto.ownershipType,
        usedOnPublicRoad: dto.usedOnPublicRoad !== undefined ? dto.usedOnPublicRoad : true,
        paymentAmount: Number(dto.paymentAmount),
        paymentMethod: dto.paymentMethod?.trim(),
        paymentReference: dto.paymentReference.trim(),
        declarationAccepted: dto.declarationAccepted,
        declarationDate: new Date(),
        declarationPlace: dto.declarationPlace.trim(),
        declarationRole: dto.declarationRole || 'owner',
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

      // Add person type and name fields
      if (dto.personType) {
        applicationData.personType = dto.personType;
      }

      if (dto.idType === 'Business Reg. No') {
        applicationData.businessName = dto.businessName?.trim();
      } else {
        applicationData.surname = dto.surname?.trim();
        applicationData.initials = dto.initials?.trim();
      }

      // Add optional fields
      if (dto.telephoneDay) {
        applicationData.telephoneDay = {
          code: dto.telephoneDay.code.trim(),
          number: dto.telephoneDay.number.trim(),
        };
      }

      // Section B - Proxy
      if (dto.hasProxy) {
        applicationData.hasProxy = true;
        applicationData.proxyIdType = dto.proxyIdType;
        applicationData.proxyIdNumber = dto.proxyIdNumber?.trim();
        applicationData.proxySurname = dto.proxySurname?.trim();
        applicationData.proxyInitials = dto.proxyInitials?.trim();
      }

      // Section C - Representative
      if (dto.hasRepresentative) {
        applicationData.hasRepresentative = true;
        applicationData.representativeIdType = dto.representativeIdType;
        applicationData.representativeIdNumber = dto.representativeIdNumber?.trim();
        applicationData.representativeSurname = dto.representativeSurname?.trim();
        applicationData.representativeInitials = dto.representativeInitials?.trim();
      }

      // Vehicle particulars
      if (dto.registrationNumber) {
        applicationData.registrationNumber = dto.registrationNumber.trim();
      }
      if (dto.vehicleCategory) {
        applicationData.vehicleCategory = dto.vehicleCategory.trim();
      }
      if (dto.vehicleDescription) {
        applicationData.vehicleDescription = dto.vehicleDescription.trim();
      }
      if (dto.netPower) {
        applicationData.netPower = dto.netPower.trim();
      }
      if (dto.engineCapacity) {
        applicationData.engineCapacity = dto.engineCapacity.trim();
      }
      if (dto.fuelType === 'other' && dto.fuelTypeOther) {
        applicationData.fuelTypeOther = dto.fuelTypeOther.trim();
      }
      if (dto.totalMass) {
        applicationData.totalMass = dto.totalMass.trim();
      }
      if (dto.grossVehicleMass) {
        applicationData.grossVehicleMass = dto.grossVehicleMass.trim();
      }
      if (dto.maxPermissibleVehicleMass) {
        applicationData.maxPermissibleVehicleMass = dto.maxPermissibleVehicleMass.trim();
      }
      if (dto.maxPermissibleDrawingMass) {
        applicationData.maxPermissibleDrawingMass = dto.maxPermissibleDrawingMass.trim();
      }
      if (dto.mainColour === 'other' && dto.mainColourOther) {
        applicationData.mainColourOther = dto.mainColourOther.trim();
      }
      if (dto.usedForTransportation) {
        applicationData.usedForTransportation = dto.usedForTransportation.trim();
      }
      if (dto.economicSector) {
        applicationData.economicSector = dto.economicSector.trim();
      }
      if (dto.odometerReading) {
        applicationData.odometerReading = dto.odometerReading.trim();
      }
      if (dto.odometerReadingKm) {
        applicationData.odometerReadingKm = dto.odometerReadingKm.trim();
      }
      if (dto.vehicleStreetAddress) {
        applicationData.vehicleStreetAddress = {
          line1: dto.vehicleStreetAddress.line1.trim(),
          line2: dto.vehicleStreetAddress.line2?.trim(),
          line3: dto.vehicleStreetAddress.line3?.trim(),
        };
      }

      // Create application
      const application = await VehicleRegModel.create(applicationData);

      logger.info(`Vehicle registration application created with ID: ${application._id}, Reference: ${referenceId}`);
      return application;
    } catch (error: any) {
      logger.error('Create vehicle registration application error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create vehicle registration application',
        details: error.message,
      };
    }
  }

  /**
   * Get application by reference ID and PIN (public tracking)
   */
  async getApplicationByReference(referenceId: string, pin: string): Promise<IVehicleReg> {
    try {
      const UNIVERSAL_PIN = '12345';
      if (pin.trim() !== UNIVERSAL_PIN) {
        throw {
          statusCode: 401,
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'Invalid PIN. Please check your PIN and try again.',
        };
      }

      const application = await VehicleRegModel.findOne({
        referenceId: { $regex: new RegExp(`^${referenceId.trim()}$`, 'i') },
      }).lean();

      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found. Please check your reference ID.',
        };
      }

      return application as unknown as IVehicleReg;
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
   * Get applications by user email
   */
  async getApplicationsByEmail(userEmail: string): Promise<IVehicleReg[]> {
    try {
      // Note: Vehicle registration doesn't have email field in the model yet
      // This is a placeholder for future enhancement
      const applications = await VehicleRegModel.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return applications as unknown as IVehicleReg[];
    } catch (error: any) {
      logger.error('Get applications by email error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve applications',
        details: error.message,
      };
    }
  }

  /**
   * Get application by ID (admin)
   */
  async getApplicationById(id: string): Promise<IVehicleReg> {
    try {
      const application = await VehicleRegModel.findById(id).lean();

      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      return application as unknown as IVehicleReg;
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
          { surname: { $regex: query.search, $options: 'i' } },
          { businessName: { $regex: query.search, $options: 'i' } },
          { identificationNumber: { $regex: query.search, $options: 'i' } },
          { make: { $regex: query.search, $options: 'i' } },
          { seriesName: { $regex: query.search, $options: 'i' } },
          { chassisNumber: { $regex: query.search, $options: 'i' } },
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
        VehicleRegModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        VehicleRegModel.countDocuments(filter),
      ]);

      return {
        applications: applications as unknown as IVehicleReg[],
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
    status: VehicleRegStatus,
    adminId: string,
    comment?: string
  ): Promise<IVehicleReg> {
    try {
      logger.info(`Updating application status: ${id} to ${status}`);

      const application = await VehicleRegModel.findById(id);
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

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

      const updated = await VehicleRegModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      logger.info(`Application ${id} status updated to ${status}`);
      return updated as unknown as IVehicleReg;
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
  async markPaymentReceived(id: string, adminId: string): Promise<IVehicleReg> {
    try {
      logger.info(`Marking payment received for application: ${id}`);

      const application = await VehicleRegModel.findById(id);
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

      const updated = await VehicleRegModel.findByIdAndUpdate(
        id,
        {
          status: 'PAID',
          paymentReceivedAt: new Date(),
          $push: { statusHistory: statusHistoryEntry },
        },
        { new: true, runValidators: true }
      ).lean();

      logger.info(`Payment marked as received for application ${id}`);
      return updated as unknown as IVehicleReg;
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
   * Mark as registered
   */
  async markRegistered(id: string, adminId: string, registrationNumber?: string): Promise<IVehicleReg> {
    try {
      logger.info(`Marking application as registered: ${id}`);

      const statusHistoryEntry: IStatusHistory = {
        status: 'REGISTERED',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Vehicle registered',
      };

      const updateData: any = {
        status: 'REGISTERED',
        registrationDate: new Date(),
        $push: { statusHistory: statusHistoryEntry },
      };

      if (registrationNumber) {
        updateData.registrationNumberAssigned = registrationNumber;
      }

      const updated = await VehicleRegModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      logger.info(`Application ${id} marked as registered`);
      return updated as unknown as IVehicleReg;
    } catch (error: any) {
      logger.error('Mark registered error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to mark as registered',
        details: error.message,
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<VehicleRegStatus, number>;
    recentApplications: IVehicleReg[];
    paymentOverdue: number;
    monthlyStats: { month: string; count: number }[];
  }> {
    try {
      const [total, statusCounts, recentApplications, paymentOverdue, monthlyStats] = await Promise.all([
        VehicleRegModel.countDocuments(),
        VehicleRegModel.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        VehicleRegModel.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        VehicleRegModel.countDocuments({
          status: 'PAYMENT_PENDING',
          paymentDeadline: { $lt: new Date() },
        }),
        VehicleRegModel.aggregate([
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

      const byStatus: Record<VehicleRegStatus, number> = {
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        DECLINED: 0,
        PAYMENT_PENDING: 0,
        PAID: 0,
        REGISTERED: 0,
        EXPIRED: 0,
      };

      statusCounts.forEach((item) => {
        byStatus[item._id as VehicleRegStatus] = item.count;
      });

      const monthlyStatsFormatted = monthlyStats.map((item) => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count,
      }));

      return {
        total,
        byStatus,
        recentApplications: recentApplications as unknown as IVehicleReg[],
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
  async updateAdminComments(id: string, comments: string, adminId: string): Promise<IVehicleReg> {
    try {
      const updated = await VehicleRegModel.findByIdAndUpdate(
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

      return updated as unknown as IVehicleReg;
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
  async assignToAdmin(id: string, adminName: string): Promise<IVehicleReg> {
    try {
      const updated = await VehicleRegModel.findByIdAndUpdate(
        id,
        { assignedTo: adminName },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      return updated as unknown as IVehicleReg;
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
  async setPriority(id: string, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'): Promise<IVehicleReg> {
    try {
      const updated = await VehicleRegModel.findByIdAndUpdate(
        id,
        { priority },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      return updated as unknown as IVehicleReg;
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

export const vehicleRegService = new VehicleRegService();
