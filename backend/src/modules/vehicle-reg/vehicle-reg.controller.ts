import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { AppAuthRequest } from '../../middlewares/appAuth';
import { vehicleRegService } from './vehicle-reg.service';
import { pdfService } from '../../services/pdf.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { VehicleRegStatus, IVehicleReg } from './vehicle-reg.model';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Normalize a vehicle registration application document into the structure expected by admin clients.
 */
const buildApplicationResponse = (application: IVehicleReg) => {
  const fullName = application.businessName || 
    [application.surname, application.initials].filter(Boolean).join(' ') || 
    '';

  return {
    id: application._id,
    referenceId: application.referenceId,
    
    // Section A - Owner
    idType: application.idType,
    identificationNumber: application.identificationNumber,
    personType: application.personType,
    surname: application.surname,
    initials: application.initials,
    businessName: application.businessName,
    postalAddress: application.postalAddress,
    streetAddress: application.streetAddress,
    telephoneDay: application.telephoneDay,
    
    // Legacy/computed fields
    fullName,
    
    // Section B - Proxy
    hasProxy: application.hasProxy,
    proxyIdType: application.proxyIdType,
    proxyIdNumber: application.proxyIdNumber,
    proxySurname: application.proxySurname,
    proxyInitials: application.proxyInitials,
    
    // Section C - Representative
    hasRepresentative: application.hasRepresentative,
    representativeIdType: application.representativeIdType,
    representativeIdNumber: application.representativeIdNumber,
    representativeSurname: application.representativeSurname,
    representativeInitials: application.representativeInitials,
    
    // Section D - Declaration
    declarationAccepted: application.declarationAccepted,
    declarationDate: application.declarationDate,
    declarationPlace: application.declarationPlace,
    declarationRole: application.declarationRole,
    
    // Section E - Vehicle
    registrationNumber: application.registrationNumber,
    make: application.make,
    seriesName: application.seriesName,
    vehicleCategory: application.vehicleCategory,
    drivenType: application.drivenType,
    vehicleDescription: application.vehicleDescription,
    netPower: application.netPower,
    engineCapacity: application.engineCapacity,
    fuelType: application.fuelType,
    fuelTypeOther: application.fuelTypeOther,
    totalMass: application.totalMass,
    grossVehicleMass: application.grossVehicleMass,
    maxPermissibleVehicleMass: application.maxPermissibleVehicleMass,
    maxPermissibleDrawingMass: application.maxPermissibleDrawingMass,
    transmission: application.transmission,
    mainColour: application.mainColour,
    mainColourOther: application.mainColourOther,
    usedForTransportation: application.usedForTransportation,
    economicSector: application.economicSector,
    odometerReading: application.odometerReading,
    odometerReadingKm: application.odometerReadingKm,
    vehicleStreetAddress: application.vehicleStreetAddress,
    ownershipType: application.ownershipType,
    usedOnPublicRoad: application.usedOnPublicRoad,
    
    // Section F - Office use
    chassisNumber: application.chassisNumber,
    engineNumber: application.engineNumber,
    feesPaidRegistration: application.feesPaidRegistration,
    receiptNumberRegistration: application.receiptNumberRegistration,
    feesPaidLicensing: application.feesPaidLicensing,
    receiptNumberLicensing: application.receiptNumberLicensing,
    roadWorthinessCompliant: application.roadWorthinessCompliant,
    roadWorthinessTestDate: application.roadWorthinessTestDate,
    roadWorthinessCertificateNumber: application.roadWorthinessCertificateNumber,
    registrationReason: application.registrationReason,
    policeClearanceSubmitted: application.policeClearanceSubmitted,
    transactionEffectiveDate: application.transactionEffectiveDate,
    firstLicensingLiabilityDate: application.firstLicensingLiabilityDate,
    registrationCertificateControlNumber: application.registrationCertificateControlNumber,
    vehicleStatus: application.vehicleStatus,
    
    // Document and status
    documentUrl: application.documentUrl,
    status: application.status,
    statusHistory: application.statusHistory,
    adminComments: application.adminComments,
    paymentDeadline: application.paymentDeadline,
    paymentReceivedAt: application.paymentReceivedAt,
    
    // Additional admin fields
    assignedTo: application.assignedTo,
    priority: application.priority,
    tags: application.tags,
    internalNotes: application.internalNotes,
    
    // Payment information
    paymentAmount: application.paymentAmount,
    paymentMethod: application.paymentMethod,
    paymentReference: application.paymentReference,
    
    // Processing information
    processedBy: application.processedBy,
    processedAt: application.processedAt,
    reviewedBy: application.reviewedBy,
    reviewedAt: application.reviewedAt,
    
    // Registration information
    registrationNumberAssigned: application.registrationNumberAssigned,
    registrationDate: application.registrationDate,
    registrationCertificateUrl: application.registrationCertificateUrl,
    
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
};

export class VehicleRegController {
  /**
   * Create a new vehicle registration application
   * POST /api/vehicle-reg/applications
   */
  async createApplication(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AppAuthRequest;
      const userEmail = authReq.user?.email;
      
      logger.info('Received vehicle registration application request:', {
        body: req.body,
        hasFile: !!req.file,
        hasUser: !!userEmail,
      });

      // Parse form data (FormData sends JSON strings for complex objects)
      const parseJSONField = (field: any) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field;
          }
        }
        return field;
      };

      const postalAddress = parseJSONField(req.body.postalAddress);
      const streetAddress = parseJSONField(req.body.streetAddress);
      const telephoneDay = parseJSONField(req.body.telephoneDay);
      const vehicleStreetAddress = parseJSONField(req.body.vehicleStreetAddress);

      // Validate document file
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Certified ID document is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Build DTO
      const dto: any = {
        idType: req.body.idType,
        identificationNumber: req.body.identificationNumber,
        personType: req.body.personType,
        surname: req.body.surname,
        initials: req.body.initials,
        businessName: req.body.businessName,
        postalAddress,
        streetAddress,
        telephoneDay,
        hasProxy: req.body.hasProxy === 'true',
        proxyIdType: req.body.proxyIdType,
        proxyIdNumber: req.body.proxyIdNumber,
        proxySurname: req.body.proxySurname,
        proxyInitials: req.body.proxyInitials,
        hasRepresentative: req.body.hasRepresentative === 'true',
        representativeIdType: req.body.representativeIdType,
        representativeIdNumber: req.body.representativeIdNumber,
        representativeSurname: req.body.representativeSurname,
        representativeInitials: req.body.representativeInitials,
        declarationAccepted: req.body.declarationAccepted === 'true',
        declarationPlace: req.body.declarationPlace,
        declarationRole: req.body.declarationRole || 'owner',
        registrationNumber: req.body.registrationNumber,
        make: req.body.make,
        seriesName: req.body.seriesName,
        vehicleCategory: req.body.vehicleCategory,
        drivenType: req.body.drivenType,
        vehicleDescription: req.body.vehicleDescription,
        netPower: req.body.netPower,
        engineCapacity: req.body.engineCapacity,
        fuelType: req.body.fuelType,
        fuelTypeOther: req.body.fuelTypeOther,
        totalMass: req.body.totalMass,
        grossVehicleMass: req.body.grossVehicleMass,
        maxPermissibleVehicleMass: req.body.maxPermissibleVehicleMass,
        maxPermissibleDrawingMass: req.body.maxPermissibleDrawingMass,
        transmission: req.body.transmission,
        mainColour: req.body.mainColour,
        mainColourOther: req.body.mainColourOther,
        usedForTransportation: req.body.usedForTransportation,
        economicSector: req.body.economicSector,
        odometerReading: req.body.odometerReading,
        odometerReadingKm: req.body.odometerReadingKm,
        vehicleStreetAddress,
        ownershipType: req.body.ownershipType,
        usedOnPublicRoad: req.body.usedOnPublicRoad === 'true',
        paymentAmount: Number(req.body.paymentAmount),
        paymentMethod: req.body.paymentMethod,
        paymentReference: req.body.paymentReference,
        applicationType: req.body.applicationType || 'new',
        email: userEmail || req.body.email,
      };

      // Create application
      const application = await vehicleRegService.createApplication(dto, req.file);

      logger.info(`Vehicle registration application created successfully: ${application._id}`);

      res.status(201).json({
        success: true,
        data: {
          application: {
            id: application._id,
            referenceId: application.referenceId,
            trackingPin: application.trackingPin,
            fullName: application.businessName || 
              [application.surname, application.initials].filter(Boolean).join(' '),
            status: application.status,
            createdAt: application.createdAt,
          },
          message: 'Application submitted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create application error:', error);
      next(error);
    }
  }

  /**
   * Get user's vehicle registration applications by email (if authenticated)
   * GET /api/vehicle-reg/my-applications
   */
  async getMyApplications(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AppAuthRequest;
      const userEmail = authReq.user?.email;

      if (!userEmail) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_MISSING_TOKEN,
            message: 'Authentication required. Please log in to view your applications.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const applications = await vehicleRegService.getApplicationsByEmail(userEmail);

      res.status(200).json({
        success: true,
        data: {
          applications: applications.map((app) => ({
            id: app._id,
            referenceId: app.referenceId,
            trackingPin: app.trackingPin,
            fullName: app.businessName || 
              [app.surname, app.initials].filter(Boolean).join(' '),
            status: app.status,
            make: app.make,
            seriesName: app.seriesName,
            statusHistory: app.statusHistory,
            paymentDeadline: app.paymentDeadline,
            paymentReceivedAt: app.paymentReceivedAt,
            adminComments: app.adminComments,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get my applications error:', error);
      next(error);
    }
  }

  /**
   * Track application by reference ID and PIN (public)
   * GET /api/vehicle-reg/track/:referenceId/:pin
   */
  async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { referenceId, pin } = req.params;

      if (!referenceId || !pin) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Reference ID and PIN are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const application = await vehicleRegService.getApplicationByReference(referenceId, pin);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            referenceId: application.referenceId,
            fullName: application.businessName || 
              [application.surname, application.initials].filter(Boolean).join(' '),
            status: application.status,
            make: application.make,
            seriesName: application.seriesName,
            statusHistory: application.statusHistory,
            paymentDeadline: application.paymentDeadline,
            paymentReceivedAt: application.paymentReceivedAt,
            adminComments: application.adminComments,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Track application error:', error);
      next(error);
    }
  }

  /**
   * List all applications (admin)
   * GET /api/vehicle-reg/applications
   */
  async listApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as VehicleRegStatus | undefined;
      const search = req.query.search as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await vehicleRegService.listApplications({
        page,
        limit,
        status,
        search,
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        data: {
          applications: result.applications.map((app) => buildApplicationResponse(app as any)),
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
      logger.error('List applications error:', error);
      next(error);
    }
  }

  /**
   * Get application by ID (admin)
   * GET /api/vehicle-reg/applications/:id
   */
  async getApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const application = await vehicleRegService.getApplicationById(id);

      res.status(200).json({
        success: true,
        data: {
          application: buildApplicationResponse(application as any),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get application error:', error);
      next(error);
    }
  }

  /**
   * Update application status (admin)
   * PUT /api/vehicle-reg/applications/:id/status
   */
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;

      if (!status || !['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DECLINED'].includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Valid status is required (SUBMITTED, UNDER_REVIEW, APPROVED, DECLINED)',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const adminId = req.user?.email || req.user?.userId || 'Unknown';
      const application = await vehicleRegService.updateStatus(id, status as VehicleRegStatus, adminId, comment);

      logger.info(`Application ${id} status updated to ${status}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            status: application.status,
            paymentDeadline: application.paymentDeadline,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Status updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update status error:', error);
      next(error);
    }
  }

  /**
   * Mark payment as received (admin)
   * PUT /api/vehicle-reg/applications/:id/payment
   */
  async markPaymentReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.email || req.user?.userId || 'Unknown';

      const application = await vehicleRegService.markPaymentReceived(id, adminId);

      logger.info(`Payment marked as received for application ${id}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            status: application.status,
            paymentReceivedAt: application.paymentReceivedAt,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Payment marked as received',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Mark payment received error:', error);
      next(error);
    }
  }

  /**
   * Mark as registered (admin)
   * PUT /api/vehicle-reg/applications/:id/register
   */
  async markRegistered(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { registrationNumber } = req.body;
      const adminId = req.user?.email || req.user?.userId || 'Unknown';

      const application = await vehicleRegService.markRegistered(id, adminId, registrationNumber);

      logger.info(`Application ${id} marked as registered`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            status: application.status,
            registrationNumberAssigned: application.registrationNumberAssigned,
            registrationDate: application.registrationDate,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Vehicle registered successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Mark registered error:', error);
      next(error);
    }
  }

  /**
   * Get dashboard statistics (admin)
   * GET /api/vehicle-reg/dashboard/stats
   */
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await vehicleRegService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: {
          stats,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      next(error);
    }
  }

  /**
   * Download application form as PDF (admin)
   * GET /api/vehicle-reg/applications/:id/download-pdf
   */
  async downloadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const application = await vehicleRegService.getApplicationById(id);
      
      logger.info('Downloading PDF for vehicle registration application', {
        applicationId: id,
        referenceId: application.referenceId,
      });

      // Resolve path to static PDF template file
      const templatePath = path.join(__dirname, '../../../data/forms/vehicle_registration.pdf');
      logger.info('Template PDF path:', templatePath);

      // Try to fill the PDF template with application data
      // Note: PDF fill functionality needs to be implemented in pdfService
      // For now, we'll return the blank form
      let pdfBuffer: Buffer;
      try {
        // Try to fill PDF if method exists
        if (pdfService.fillVehicleRegFormPDF) {
          pdfBuffer = await pdfService.fillVehicleRegFormPDF(application, templatePath);
        } else {
          // Fallback to blank form
          pdfBuffer = await fs.readFile(templatePath);
        }
      } catch (error) {
        logger.warn('Could not fill PDF, returning blank form', error);
        pdfBuffer = await fs.readFile(templatePath);
      }
      
      logger.info('PDF ready', {
        bufferSize: pdfBuffer.length,
        applicationId: id,
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Vehicle-Registration-${application.referenceId}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      // Send filled PDF
      res.send(pdfBuffer);
    } catch (error: any) {
      logger.error('Download PDF error:', error);
      next(error);
    }
  }

  /**
   * Update admin comments (admin)
   * PUT /api/vehicle-reg/applications/:id/comments
   */
  async updateAdminComments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      if (!comments || typeof comments !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Comments are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const adminId = req.user?.email || req.user?.userId || 'Unknown';
      const application = await vehicleRegService.updateAdminComments(id, comments, adminId);

      logger.info(`Admin comments updated for application ${id}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            adminComments: application.adminComments,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Admin comments updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update admin comments error:', error);
      next(error);
    }
  }

  /**
   * Assign application to admin (admin)
   * PUT /api/vehicle-reg/applications/:id/assign
   */
  async assignToAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo || typeof assignedTo !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Assigned to field is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const application = await vehicleRegService.assignToAdmin(id, assignedTo);

      logger.info(`Application ${id} assigned to ${assignedTo}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            assignedTo: application.assignedTo,
            updatedAt: application.updatedAt,
          },
          message: 'Application assigned successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Assign to admin error:', error);
      next(error);
    }
  }

  /**
   * Set application priority (admin)
   * PUT /api/vehicle-reg/applications/:id/priority
   */
  async setPriority(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      if (!priority || !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(priority)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Valid priority is required (LOW, NORMAL, HIGH, URGENT)',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const application = await vehicleRegService.setPriority(id, priority);

      logger.info(`Application ${id} priority set to ${priority}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            priority: application.priority,
            updatedAt: application.updatedAt,
          },
          message: 'Priority updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Set priority error:', error);
      next(error);
    }
  }

  /**
   * Download blank vehicle registration form PDF (public)
   * GET /api/vehicle-reg/form
   */
  async downloadForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templatePath = path.join(__dirname, '../../../data/forms/vehicle_registration.pdf');

      // Check if file exists
      try {
        await fs.access(templatePath);
      } catch (error) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'Vehicle registration form PDF not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Read the PDF file
      const pdfBuffer = await fs.readFile(templatePath);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Vehicle-Registration-Form.pdf"'
      );
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      // Send PDF
      res.send(pdfBuffer);
    } catch (error: any) {
      logger.error('Download form error:', error);
      next(error);
    }
  }
}

export const vehicleRegController = new VehicleRegController();
