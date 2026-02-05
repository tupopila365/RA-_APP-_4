import { AppDataSource } from '../../config/db';
import { PLN } from './pln.entity';
import type { IPLN, PLNStatus, IStatusHistory } from './pln.model';
import { FieldEncryption } from '../../utils/encryption';
import { uploadService } from '../upload/upload.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { CreateApplicationDTO, ListApplicationsQuery, ListApplicationsResult } from './pln.dto';
import { SecureIdGenerator } from '../../utils/secureIdGenerator';

function parseId(id: string): number {
  const num = parseInt(id, 10);
  if (isNaN(num)) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Application not found',
    };
  }
  return num;
}

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

      const repo = AppDataSource.getRepository(PLN);
      // Generate unique reference ID
      let referenceId = this.generateReferenceId();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await repo.findOne({ where: { referenceId } });
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

      // Set required encrypted/hash columns (entity requires surname_encrypted, initials_encrypted, surname_hash)
      applicationData.surname_encrypted = FieldEncryption.encrypt(applicationData.surname || '');
      applicationData.initials_encrypted = FieldEncryption.encrypt(applicationData.initials || '');
      applicationData.surname_hash = FieldEncryption.hash(applicationData.surname || '');
      if (applicationData.trafficRegisterNumber) {
        applicationData.trafficRegisterNumber_encrypted = FieldEncryption.encrypt(applicationData.trafficRegisterNumber);
        applicationData.trafficRegisterNumber_hash = FieldEncryption.hash(applicationData.trafficRegisterNumber);
      }
      if (applicationData.businessRegNumber) {
        applicationData.businessRegNumber_encrypted = FieldEncryption.encrypt(applicationData.businessRegNumber);
        applicationData.businessRegNumber_hash = FieldEncryption.hash(applicationData.businessRegNumber);
      }
      if (applicationData.businessName) {
        applicationData.businessName_encrypted = FieldEncryption.encrypt(applicationData.businessName);
      }
      if (applicationData.email) {
        applicationData.email_encrypted = FieldEncryption.encrypt(applicationData.email);
        applicationData.email_hash = FieldEncryption.hash(applicationData.email);
      }
      if (applicationData.fullName) {
        applicationData.fullName_encrypted = FieldEncryption.encrypt(applicationData.fullName);
        applicationData.fullName_hash = FieldEncryption.hash(applicationData.fullName);
      }
      if (applicationData.idNumber) {
        applicationData.idNumber_encrypted = FieldEncryption.encrypt(applicationData.idNumber);
        applicationData.idNumber_hash = FieldEncryption.hash(applicationData.idNumber);
      }
      if (applicationData.phoneNumber) {
        applicationData.phoneNumber_encrypted = FieldEncryption.encrypt(applicationData.phoneNumber);
      }

      const application = repo.create(applicationData as import('typeorm').DeepPartial<PLN>) as PLN;
      const saved = await repo.save(application);

      logger.info(`PLN application created with ID: ${saved.id}, Reference: ${referenceId}`);
      return saved as unknown as IPLN;
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
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo
        .createQueryBuilder('p')
        .where('LOWER(p.referenceId) = LOWER(:ref)', { ref: referenceId.trim() })
        .getOne();

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
   * Get applications by user email
   */
  async getApplicationsByEmail(userEmail: string): Promise<IPLN[]> {
    try {
      const applications = await AppDataSource.getRepository(PLN).find({
        where: { email: userEmail.toLowerCase() },
        order: { createdAt: 'DESC' },
      });

      return applications as unknown as IPLN[];
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
  async getApplicationById(id: string): Promise<IPLN> {
    try {
      const numId = parseId(id);
      const application = await AppDataSource.getRepository(PLN).findOne({ where: { id: numId } });

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

      const repo = AppDataSource.getRepository(PLN);
      const qb = repo.createQueryBuilder('p');

      if (query.status) {
        qb.andWhere('p.status = :status', { status: query.status });
      }

      if (query.search) {
        qb.andWhere(
          '(p.referenceId LIKE :search OR p.fullName LIKE :search OR p.surname LIKE :search OR p.businessName LIKE :search OR p.idNumber LIKE :search OR p.trafficRegisterNumber LIKE :search OR p.businessRegNumber LIKE :search OR p.phoneNumber LIKE :search OR p.email LIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      if (query.startDate) {
        qb.andWhere('p.createdAt >= :startDate', { startDate: new Date(query.startDate) });
      }
      if (query.endDate) {
        qb.andWhere('p.createdAt <= :endDate', { endDate: new Date(query.endDate) });
      }

      const [applications, total] = await qb
        .orderBy('p.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

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

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      let effectiveStatus = status;
      if (status === 'APPROVED') {
        effectiveStatus = 'PAYMENT_PENDING';
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 21);
        application.paymentDeadline = deadline;
      }

      const statusHistoryEntry: IStatusHistory = {
        status: effectiveStatus,
        changedBy: adminId,
        timestamp: new Date(),
        comment,
      };

      application.status = effectiveStatus;
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        statusHistoryEntry,
      ];

      const updated = await repo.save(application);

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

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
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

      application.status = 'PAID';
      application.paymentReceivedAt = new Date();
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        statusHistoryEntry,
      ];

      const updated = await repo.save(application);

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

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      const statusHistoryEntry: IStatusHistory = {
        status: 'PLATES_ORDERED',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Plates ordered for manufacturing',
      };

      application.status = 'PLATES_ORDERED';
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        statusHistoryEntry,
      ];

      const updated = await repo.save(application);

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

      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      const statusHistoryEntry: IStatusHistory = {
        status: 'READY_FOR_COLLECTION',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Plates ready for collection',
      };

      application.status = 'READY_FOR_COLLECTION';
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        statusHistoryEntry,
      ];

      const updated = await repo.save(application);

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
      const repo = AppDataSource.getRepository(PLN);

      const total = await repo.count();

      const statusRows = await repo
        .createQueryBuilder('p')
        .select('p.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.status')
        .getRawMany();

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
      (statusRows as { status: string; count: string }[]).forEach((item) => {
        byStatus[item.status as PLNStatus] = parseInt(item.count, 10) || 0;
      });

      const recentApplications = await repo.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });

      const paymentOverdue = await repo
        .createQueryBuilder('p')
        .where('p.status = :status', { status: 'PAYMENT_PENDING' })
        .andWhere('p.paymentDeadline < :now', { now: new Date() })
        .getCount();

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyRows = await repo
        .createQueryBuilder('p')
        .select('YEAR(p.createdAt)', 'year')
        .addSelect('MONTH(p.createdAt)', 'month')
        .addSelect('COUNT(*)', 'count')
        .where('p.createdAt >= :from', { from: twelveMonthsAgo })
        .groupBy('YEAR(p.createdAt)')
        .addGroupBy('MONTH(p.createdAt)')
        .orderBy('YEAR(p.createdAt)', 'ASC')
        .addOrderBy('MONTH(p.createdAt)', 'ASC')
        .getRawMany();

      const monthlyStatsFormatted = (monthlyRows as { year: number; month: number; count: string }[]).map(
        (item) => ({
          month: `${item.year}-${item.month.toString().padStart(2, '0')}`,
          count: parseInt(item.count, 10) || 0,
        })
      );

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
      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      application.adminComments = comments ?? null;
      const statusHistoryEntry: IStatusHistory = {
        status: 'UNDER_REVIEW',
        changedBy: adminId,
        timestamp: new Date(),
        comment: 'Admin comments updated',
      };
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        statusHistoryEntry,
      ];

      const updated = await repo.save(application);

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
      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      application.assignedTo = assignedTo;
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        {
          status: 'UNDER_REVIEW',
          changedBy: adminId,
          timestamp: new Date(),
          comment: `Application assigned to ${assignedTo}`,
        },
      ];

      const updated = await repo.save(application);
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
      const numId = parseId(id);
      const repo = AppDataSource.getRepository(PLN);
      const application = await repo.findOne({ where: { id: numId } });
      if (!application) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Application not found',
        };
      }

      application.priority = priority;
      application.statusHistory = [
        ...(Array.isArray(application.statusHistory) ? application.statusHistory : []),
        {
          status: 'UNDER_REVIEW',
          changedBy: adminId,
          timestamp: new Date(),
          comment: `Priority set to ${priority}`,
        },
      ];

      const updated = await repo.save(application);
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



