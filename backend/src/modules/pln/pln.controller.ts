import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { plnService } from './pln.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { PLNStatus } from './pln.model';

export class PLNController {
  /**
   * Create a new PLN application
   * POST /api/pln/applications
   */
  async createApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Received PLN application request:', {
        body: req.body,
        hasFile: !!req.file,
      });

      // Parse form data (FormData sends JSON strings)
      let plateChoices = req.body.plateChoices;
      if (typeof plateChoices === 'string') {
        try {
          plateChoices = JSON.parse(plateChoices);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid plate choices format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const { fullName, idNumber, phoneNumber } = req.body;

      // Validate required fields
      if (!fullName || !fullName.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Full name is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!idNumber || !idNumber.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'ID number is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!phoneNumber || !phoneNumber.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Phone number is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!plateChoices || !Array.isArray(plateChoices) || plateChoices.length !== 3) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Exactly 3 plate choices are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

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

      // Create application
      const application = await plnService.createApplication(
        {
          fullName: fullName.trim(),
          idNumber: idNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          plateChoices,
        },
        req.file
      );

      logger.info(`PLN application created successfully: ${application._id}`);

      res.status(201).json({
        success: true,
        data: {
          application: {
            id: application._id,
            referenceId: application.referenceId,
            fullName: application.fullName,
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
   * Track application by reference ID and ID number (public)
   * GET /api/pln/track/:referenceId/:idNumber
   */
  async trackApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { referenceId, idNumber } = req.params;

      if (!referenceId || !idNumber) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Reference ID and ID number are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const application = await plnService.getApplicationByReference(referenceId, idNumber);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            referenceId: application.referenceId,
            fullName: application.fullName,
            status: application.status,
            plateChoices: application.plateChoices,
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
   * GET /api/pln/applications
   */
  async listApplications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as PLNStatus | undefined;
      const search = req.query.search as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await plnService.listApplications({
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
          applications: result.applications.map((app) => ({
            id: app._id,
            referenceId: app.referenceId,
            fullName: app.fullName,
            idNumber: app.idNumber,
            phoneNumber: app.phoneNumber,
            plateChoices: app.plateChoices,
            status: app.status,
            paymentDeadline: app.paymentDeadline,
            paymentReceivedAt: app.paymentReceivedAt,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          })),
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
   * GET /api/pln/applications/:id
   */
  async getApplication(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const application = await plnService.getApplicationById(id);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            referenceId: application.referenceId,
            fullName: application.fullName,
            idNumber: application.idNumber,
            phoneNumber: application.phoneNumber,
            plateChoices: application.plateChoices,
            documentUrl: application.documentUrl,
            status: application.status,
            statusHistory: application.statusHistory,
            adminComments: application.adminComments,
            paymentDeadline: application.paymentDeadline,
            paymentReceivedAt: application.paymentReceivedAt,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
          },
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
   * PUT /api/pln/applications/:id/status
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

      const adminId = req.user?.email || req.user?.id || 'Unknown';
      const application = await plnService.updateStatus(id, status as PLNStatus, adminId, comment);

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
   * PUT /api/pln/applications/:id/payment
   */
  async markPaymentReceived(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.email || req.user?.id || 'Unknown';

      const application = await plnService.markPaymentReceived(id, adminId);

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
   * Order plates (admin)
   * PUT /api/pln/applications/:id/order-plates
   */
  async orderPlates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.email || req.user?.id || 'Unknown';

      const application = await plnService.orderPlates(id, adminId);

      logger.info(`Plates ordered for application ${id}`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            status: application.status,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Plates ordered successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Order plates error:', error);
      next(error);
    }
  }

  /**
   * Mark ready for collection (admin)
   * PUT /api/pln/applications/:id/ready
   */
  async markReadyForCollection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.email || req.user?.id || 'Unknown';

      const application = await plnService.markReadyForCollection(id, adminId);

      logger.info(`Application ${id} marked as ready for collection`);

      res.status(200).json({
        success: true,
        data: {
          application: {
            id: application._id,
            status: application.status,
            statusHistory: application.statusHistory,
            updatedAt: application.updatedAt,
          },
          message: 'Application marked as ready for collection',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Mark ready for collection error:', error);
      next(error);
    }
  }

  /**
   * Get dashboard statistics (admin)
   * GET /api/pln/dashboard/stats
   */
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await plnService.getDashboardStats();

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
}

export const plnController = new PLNController();


