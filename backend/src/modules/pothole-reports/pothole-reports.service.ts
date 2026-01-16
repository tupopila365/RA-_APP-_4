import { PotholeReportModel, IPotholeReport, Severity, ReportStatus } from './pothole-reports.model';
import { uploadService } from '../upload/upload.service';
import { reverseGeocode } from '../../utils/geocoding';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateReportDTO {
  deviceId: string;
  userEmail?: string; // User's email if logged in
  location: {
    latitude: number;
    longitude: number;
  };
  roadName?: string;
  townName?: string;
  streetName?: string;
  description?: string;
  // Note: severity is NOT included here - it's admin-only
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  deviceId?: string;
  region?: string;
  town?: string;
  severity?: Severity;
  status?: ReportStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListReportsResult {
  reports: IPotholeReport[];
  total: number;
  page: number;
  totalPages: number;
}

class PotholeReportsService {
  /**
   * Generate unique reference code
   * Format: RA-PT-{YYYYMMDD}-{6digitRandom}
   */
  generateReferenceCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `RA-PT-${dateStr}-${random}`;
  }

  /**
   * Create a new pothole report
   */
  async createReport(dto: CreateReportDTO, photoFile: Express.Multer.File): Promise<IPotholeReport> {
    try {
      logger.info('Creating pothole report:', { deviceId: dto.deviceId, roadName: dto.roadName });

      // Upload photo to Cloudinary
      const photoUpload = await uploadService.uploadImage(photoFile);

      // Use provided town/region or reverse geocode location to get them
      let town = dto.townName || '';
      let region = '';
      
      if (!town) {
        // Reverse geocode location to get town and region
        const geocodeResult = await reverseGeocode(
          dto.location.latitude,
          dto.location.longitude
        );
        town = geocodeResult.town;
        region = geocodeResult.region;
      } else {
        // If town is provided, try to get region from reverse geocoding
        try {
          const geocodeResult = await reverseGeocode(
            dto.location.latitude,
            dto.location.longitude
          );
          region = geocodeResult.region;
        } catch (error) {
          logger.warn('Failed to get region from reverse geocoding:', error);
          region = 'Unknown';
        }
      }

      // Generate unique reference code
      let referenceCode = this.generateReferenceCode();
      // Ensure uniqueness (retry if collision)
      let attempts = 0;
      while (attempts < 10) {
        const existing = await PotholeReportModel.findOne({ referenceCode });
        if (!existing) break;
        referenceCode = this.generateReferenceCode();
        attempts++;
      }

      // Determine road name - use streetName if provided, otherwise roadName, otherwise 'Unknown Road'
      const finalRoadName = dto.streetName || dto.roadName || 'Unknown Road';

      // Create report (severity is NOT set - admin will set it later)
      const report = await PotholeReportModel.create({
        deviceId: dto.deviceId,
        userEmail: dto.userEmail, // Associate with user email if provided
        referenceCode,
        location: dto.location,
        town: town || 'Unknown',
        region: region || 'Unknown',
        roadName: finalRoadName,
        photoUrl: photoUpload.url,
        description: dto.description,
        status: 'pending',
        // severity is intentionally omitted - admin-only field
      });

      logger.info(`Pothole report created with ID: ${report._id}, Reference: ${referenceCode}`);
      return report;
    } catch (error: any) {
      logger.error('Create pothole report error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create pothole report',
        details: error.message,
      };
    }
  }

  /**
   * Get reports by device ID
   */
  async getReportsByDeviceId(deviceId: string, filters?: { status?: ReportStatus }): Promise<IPotholeReport[]> {
    try {
      const filter: any = { deviceId };
      if (filters?.status) {
        filter.status = filters.status;
      }

      const reports = await PotholeReportModel.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return reports as unknown as IPotholeReport[];
    } catch (error: any) {
      logger.error('Get reports by device ID error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve reports',
        details: error.message,
      };
    }
  }

  /**
   * Get reports by user email
   */
  async getReportsByUserEmail(userEmail: string, filters?: { status?: ReportStatus }): Promise<IPotholeReport[]> {
    try {
      const filter: any = { userEmail: userEmail.toLowerCase() };
      if (filters?.status) {
        filter.status = filters.status;
      }

      const reports = await PotholeReportModel.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return reports as unknown as IPotholeReport[];
    } catch (error: any) {
      logger.error('Get reports by user email error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve reports',
        details: error.message,
      };
    }
  }

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: string): Promise<IPotholeReport> {
    try {
      const report = await PotholeReportModel.findById(reportId).lean();

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      return report as unknown as IPotholeReport;
    } catch (error: any) {
      logger.error('Get report error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve report',
        details: error.message,
      };
    }
  }

  /**
   * List reports with pagination and filtering (admin)
   */
  async listReports(query: ListReportsQuery): Promise<ListReportsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.deviceId) {
        filter.deviceId = query.deviceId;
      }

      if (query.region) {
        filter.region = query.region;
      }

      if (query.town) {
        filter.town = query.town;
      }

      if (query.severity) {
        filter.severity = query.severity;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.search) {
        filter.$or = [
          { referenceCode: { $regex: query.search, $options: 'i' } },
          { roadName: { $regex: query.search, $options: 'i' } },
          { town: { $regex: query.search, $options: 'i' } },
          { region: { $regex: query.search, $options: 'i' } },
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
      const [reports, total] = await Promise.all([
        PotholeReportModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PotholeReportModel.countDocuments(filter),
      ]);

      return {
        reports: reports as unknown as IPotholeReport[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('List reports error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve reports',
        details: error.message,
      };
    }
  }

  /**
   * Update report status (admin-only)
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    updates?: { assignedTo?: string; adminNotes?: string; severity?: Severity }
  ): Promise<IPotholeReport> {
    try {
      logger.info(`Updating report status: ${reportId} to ${status}`);

      const updateData: any = { status };

      if (updates?.assignedTo !== undefined) {
        updateData.assignedTo = updates.assignedTo;
      }

      if (updates?.adminNotes !== undefined) {
        updateData.adminNotes = updates.adminNotes;
      }

      // Admin can set severity when updating status
      if (updates?.severity !== undefined) {
        updateData.severity = updates.severity;
      }

      const report = await PotholeReportModel.findByIdAndUpdate(
        reportId,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      logger.info(`Report ${reportId} status updated to ${status}`);
      return report as unknown as IPotholeReport;
    } catch (error: any) {
      logger.error('Update report status error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update report status',
        details: error.message,
      };
    }
  }

  /**
   * Assign report to maintenance team
   */
  async assignReport(reportId: string, assignedTo: string): Promise<IPotholeReport> {
    try {
      logger.info(`Assigning report ${reportId} to ${assignedTo}`);

      const report = await PotholeReportModel.findByIdAndUpdate(
        reportId,
        {
          assignedTo,
          status: 'assigned',
        },
        { new: true, runValidators: true }
      ).lean();

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      logger.info(`Report ${reportId} assigned to ${assignedTo}`);
      return report as unknown as IPotholeReport;
    } catch (error: any) {
      logger.error('Assign report error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to assign report',
        details: error.message,
      };
    }
  }

  /**
   * Add admin notes to report
   */
  async addAdminNotes(reportId: string, adminNotes: string): Promise<IPotholeReport> {
    try {
      logger.info(`Adding admin notes to report ${reportId}`);

      const report = await PotholeReportModel.findByIdAndUpdate(
        reportId,
        { adminNotes },
        { new: true, runValidators: true }
      ).lean();

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      logger.info(`Admin notes added to report ${reportId}`);
      return report as unknown as IPotholeReport;
    } catch (error: any) {
      logger.error('Add admin notes error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to add admin notes',
        details: error.message,
      };
    }
  }

  /**
   * Mark report as fixed
   */
  async markAsFixed(reportId: string, repairPhotoFile?: Express.Multer.File): Promise<IPotholeReport> {
    try {
      logger.info(`Marking report ${reportId} as fixed`);

      const updateData: any = {
        status: 'fixed',
      };

      // Upload repair photo if provided
      if (repairPhotoFile) {
        const photoUpload = await uploadService.uploadImage(repairPhotoFile);
        updateData.repairPhotoUrl = photoUpload.url;
      }

      const report = await PotholeReportModel.findByIdAndUpdate(
        reportId,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      logger.info(`Report ${reportId} marked as fixed`);
      return report as unknown as IPotholeReport;
    } catch (error: any) {
      logger.error('Mark as fixed error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to mark report as fixed',
        details: error.message,
      };
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      logger.info(`Deleting report: ${reportId}`);

      const report = await PotholeReportModel.findById(reportId);
      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      // Delete photos from Cloudinary if they exist
      if (report.photoUrl) {
        try {
          // Extract public ID from Cloudinary URL
          const urlParts = report.photoUrl.split('/');
          const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
          const publicId = publicIdWithExt.replace('roads-authority/', '');
          await uploadService.deleteImage(`roads-authority/${publicId}`);
        } catch (error) {
          logger.warn(`Failed to delete photo from Cloudinary: ${error}`);
        }
      }

      if (report.repairPhotoUrl) {
        try {
          const urlParts = report.repairPhotoUrl.split('/');
          const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
          const publicId = publicIdWithExt.replace('roads-authority/', '');
          await uploadService.deleteImage(`roads-authority/${publicId}`);
        } catch (error) {
          logger.warn(`Failed to delete repair photo from Cloudinary: ${error}`);
        }
      }

      await PotholeReportModel.findByIdAndDelete(reportId);

      logger.info(`Report ${reportId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete report error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete report',
        details: error.message,
      };
    }
  }

  /**
   * Get unique regions and towns for filtering
   */
  async getRegionsAndTowns(): Promise<{ regions: string[]; towns: string[] }> {
    try {
      const [regions, towns] = await Promise.all([
        PotholeReportModel.distinct('region'),
        PotholeReportModel.distinct('town'),
      ]);

      return {
        regions: regions.filter((r) => r && r !== 'Unknown').sort(),
        towns: towns.filter((t) => t && t !== 'Unknown').sort(),
      };
    } catch (error: any) {
      logger.error('Get regions and towns error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve regions and towns',
        details: error.message,
      };
    }
  }
}

export const potholeReportsService = new PotholeReportsService();

