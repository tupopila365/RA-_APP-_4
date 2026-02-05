import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { AppAuthRequest } from '../../middlewares/appAuth';
import { potholeReportsService } from './pothole-reports.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { Severity, ReportStatus } from './pothole-reports.model';

export class PotholeReportsController {
  /**
   * Create a new pothole report
   * POST /api/pothole-reports
   */
  async createReport(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Received pothole report request:', {
        headers: { 'x-device-id': req.headers['x-device-id'] },
        body: req.body,
        hasFile: !!req.file,
        fileInfo: req.file ? { fieldname: req.file.fieldname, mimetype: req.file.mimetype, size: req.file.size } : null,
        hasUser: !!(req as AuthRequest).user,
      });

      // Get deviceId from header (public endpoint, no auth required)
      const deviceId = req.headers['x-device-id'] as string;
      
      // Get user email if authenticated (optional - for logged-in users)
      const authReq = req as AppAuthRequest;
      const userEmail = authReq.user?.email || req.body.userEmail || undefined;

      if (!deviceId) {
        logger.warn('Create report failed: Device ID missing');
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Device ID is required. Please include X-Device-ID header.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate required fields
      // Note: FormData sends JSON strings, so we need to parse them
      let location = req.body.location;
      const { roadName, townName, streetName, description } = req.body;

      // Parse location if it's a string (from FormData)
      if (typeof location === 'string') {
        try {
          location = JSON.parse(location);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid location format. Location must be a valid JSON object.',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Valid location with latitude and longitude is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!roadName?.trim() && !streetName?.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Either road name or street name is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate photo file
      if (!req.file) {
        logger.warn('Create report failed: Photo file missing', { deviceId, roadName });
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Photo is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('All validations passed, creating report...', { deviceId, roadName });

      // Create report
      const report = await potholeReportsService.createReport(
        {
          deviceId,
          userEmail: userEmail?.toLowerCase(), // Associate with user email if provided
          location,
          roadName: roadName?.trim(),
          townName: townName?.trim(),
          streetName: streetName?.trim(),
          description: description?.trim(),
        },
        req.file
      );

      logger.info(`Pothole report created successfully: ${report.id}`);

      res.status(201).json({
        success: true,
        data: {
          report: {
            id: report.id,
            referenceCode: report.referenceCode,
            location: report.location,
            town: report.town,
            region: report.region,
            roadName: report.roadName,
            photoUrl: report.photoUrl,
            severity: report.severity, // Will be null/undefined until admin sets it
            description: report.description,
            status: report.status,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
          },
          message: 'Pothole report created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create report error:', error);
      next(error);
    }
  }

  /**
   * Get user's reports by email (if authenticated) or device ID
   * GET /api/pothole-reports/my-reports
   */
  async getMyReports(req: Request | AppAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AppAuthRequest;
      const userEmail = authReq.user?.email;
      const deviceId = req.headers['x-device-id'] as string;

      // If user is authenticated, use email; otherwise fall back to deviceId
      let reports;
      if (userEmail) {
        const status = req.query.status as ReportStatus | undefined;
        reports = await potholeReportsService.getReportsByUserEmail(userEmail, {
          status,
        });
      } else if (deviceId) {
        const status = req.query.status as ReportStatus | undefined;
        reports = await potholeReportsService.getReportsByDeviceId(deviceId, {
          status,
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Either authentication or Device ID is required. Please log in or include X-Device-ID header.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          reports: reports.map((report) => ({
            id: report.id,
            referenceCode: report.referenceCode,
            location: report.location,
            town: report.town,
            region: report.region,
            roadName: report.roadName,
            photoUrl: report.photoUrl,
            severity: report.severity, // Admin-set field
            description: report.description,
            status: report.status,
            assignedTo: report.assignedTo,
            adminNotes: report.adminNotes,
            repairPhotoUrl: report.repairPhotoUrl,
            fixedAt: report.fixedAt,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get my reports error:', error);
      next(error);
    }
  }

  /**
   * Get a single report by ID
   * GET /api/pothole-reports/:id
   */
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const report = await potholeReportsService.getReportById(id);

      res.status(200).json({
        success: true,
        data: {
          report: {
            id: report.id,
            referenceCode: report.referenceCode,
            location: report.location,
            town: report.town,
            region: report.region,
            roadName: report.roadName,
            photoUrl: report.photoUrl,
            severity: report.severity, // Admin-set field
            description: report.description,
            status: report.status,
            assignedTo: report.assignedTo,
            adminNotes: report.adminNotes,
            repairPhotoUrl: report.repairPhotoUrl,
            fixedAt: report.fixedAt,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get report error:', error);
      next(error);
    }
  }

  /**
   * List all reports with filtering (admin)
   * GET /api/pothole-reports
   */
  async listReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('List reports request received:', {
        query: req.query,
        user: req.user?.email,
        userId: req.user?.userId,
      });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const deviceId = req.query.deviceId as string;
      const region = req.query.region as string;
      const town = req.query.town as string;
      const severity = req.query.severity as Severity | undefined;
      const status = req.query.status as ReportStatus | undefined;
      const search = req.query.search as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      logger.info('List reports params:', {
        page,
        limit,
        deviceId,
        region,
        town,
        severity,
        status,
        search,
        startDate,
        endDate,
      });

      const result = await potholeReportsService.listReports({
        page,
        limit,
        deviceId,
        region,
        town,
        severity,
        status,
        search,
        startDate,
        endDate,
      });

      logger.info('List reports result:', {
        total: result.total,
        reportsCount: result.reports.length,
        page: result.page,
        totalPages: result.totalPages,
      });

      res.status(200).json({
        success: true,
        data: {
          reports: result.reports.map((report) => ({
            id: report.id,
            deviceId: report.deviceId,
            referenceCode: report.referenceCode,
            location: report.location,
            town: report.town,
            region: report.region,
            roadName: report.roadName,
            photoUrl: report.photoUrl,
            severity: report.severity, // Admin-set field
            description: report.description,
            status: report.status,
            assignedTo: report.assignedTo,
            adminNotes: report.adminNotes,
            repairPhotoUrl: report.repairPhotoUrl,
            fixedAt: report.fixedAt,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
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
      logger.error('List reports error:', error);
      next(error);
    }
  }

  /**
   * Update report status
   * PUT /api/pothole-reports/:id/status
   */
  async updateReportStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, assignedTo, adminNotes, severity } = req.body;

      if (!status || !['pending', 'assigned', 'in-progress', 'fixed', 'duplicate', 'invalid'].includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Valid status is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate severity if provided (admin can set risk level)
      if (severity && !['low', 'medium', 'high'].includes(severity)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Severity must be one of: low, medium, high',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const report = await potholeReportsService.updateReportStatus(id, status as ReportStatus, {
        assignedTo,
        adminNotes,
        severity: severity as Severity | undefined,
      });

      logger.info(`Report ${id} status updated to ${status}`);

      res.status(200).json({
        success: true,
        data: {
          report: {
            id: report.id,
            status: report.status,
            severity: report.severity, // Admin-set risk level
            assignedTo: report.assignedTo,
            adminNotes: report.adminNotes,
            updatedAt: report.updatedAt,
          },
          message: 'Report status updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update report status error:', error);
      next(error);
    }
  }

  /**
   * Assign report to maintenance team
   * PUT /api/pothole-reports/:id/assign
   */
  async assignReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo || !assignedTo.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Assigned to is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const report = await potholeReportsService.assignReport(id, assignedTo.trim());

      logger.info(`Report ${id} assigned to ${assignedTo}`);

      res.status(200).json({
        success: true,
        data: {
          report: {
            id: report.id,
            status: report.status,
            assignedTo: report.assignedTo,
            updatedAt: report.updatedAt,
          },
          message: 'Report assigned successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Assign report error:', error);
      next(error);
    }
  }

  /**
   * Add admin notes to report
   * PUT /api/pothole-reports/:id/notes
   */
  async addAdminNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      if (!adminNotes || !adminNotes.trim()) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Admin notes are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const report = await potholeReportsService.addAdminNotes(id, adminNotes.trim());

      logger.info(`Admin notes added to report ${id}`);

      res.status(200).json({
        success: true,
        data: {
          report: {
            id: report.id,
            adminNotes: report.adminNotes,
            updatedAt: report.updatedAt,
          },
          message: 'Admin notes added successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Add admin notes error:', error);
      next(error);
    }
  }

  /**
   * Mark report as fixed
   * PUT /api/pothole-reports/:id/fixed
   */
  async markAsFixed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const report = await potholeReportsService.markAsFixed(id, req.file);

      logger.info(`Report ${id} marked as fixed`);

      res.status(200).json({
        success: true,
        data: {
          report: {
            id: report.id,
            status: report.status,
            repairPhotoUrl: report.repairPhotoUrl,
            fixedAt: report.fixedAt,
            updatedAt: report.updatedAt,
          },
          message: 'Report marked as fixed successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Mark as fixed error:', error);
      next(error);
    }
  }

  /**
   * Delete a report
   * DELETE /api/pothole-reports/:id
   */
  async deleteReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await potholeReportsService.deleteReport(id);

      logger.info(`Report ${id} deleted successfully`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Report deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete report error:', error);
      next(error);
    }
  }

  /**
   * Get regions and towns for filtering
   * GET /api/pothole-reports/filters/regions-towns
   */
  async getRegionsAndTowns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { regions, towns } = await potholeReportsService.getRegionsAndTowns();

      res.status(200).json({
        success: true,
        data: {
          regions,
          towns,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get regions and towns error:', error);
      next(error);
    }
  }
}

export const potholeReportsController = new PotholeReportsController();

