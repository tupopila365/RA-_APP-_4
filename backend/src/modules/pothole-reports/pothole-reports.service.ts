import { AppDataSource } from '../../config/db';
import { PotholeReport } from './pothole-reports.entity';
import { uploadService } from '../upload/upload.service';
import { fileStorageService } from '../file-storage/file-storage.service';
import { reverseGeocode } from '../../utils/geocoding';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import type { Severity, ReportStatus } from './pothole-reports.model';
import type { FindOptionsWhere } from 'typeorm';

export interface CreateReportDTO {
  deviceId: string;
  userEmail?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  roadName?: string;
  townName?: string;
  streetName?: string;
  description?: string;
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
  reports: PotholeReport[];
  total: number;
  page: number;
  totalPages: number;
}

function parseId(reportId: string): number {
  const id = parseInt(reportId, 10);
  if (isNaN(id)) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Pothole report not found',
    };
  }
  return id;
}

class PotholeReportsService {
  generateReferenceCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `RA-PT-${dateStr}-${random}`;
  }

  async createReport(dto: CreateReportDTO, photoFile: Express.Multer.File): Promise<PotholeReport> {
    try {
      logger.info('Creating pothole report:', { deviceId: dto.deviceId, roadName: dto.roadName });

      const photoUpload = await uploadService.uploadImage(photoFile);

      let town = dto.townName || '';
      let region = '';

      if (!town) {
        const geocodeResult = await reverseGeocode(
          dto.location.latitude,
          dto.location.longitude
        );
        town = geocodeResult.town;
        region = geocodeResult.region;
      } else {
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

      const repo = AppDataSource.getRepository(PotholeReport);
      let referenceCode = this.generateReferenceCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await repo.findOne({ where: { referenceCode } });
        if (!existing) break;
        referenceCode = this.generateReferenceCode();
        attempts++;
      }

      const finalRoadName = dto.streetName || dto.roadName || 'Unknown Road';

      const report = repo.create({
        deviceId: dto.deviceId,
        userEmail: dto.userEmail ?? null,
        referenceCode,
        location: dto.location,
        town: town || 'Unknown',
        region: region || 'Unknown',
        roadName: finalRoadName,
        photoUrl: photoUpload.url,
        description: dto.description ?? null,
        status: 'pending',
      });

      const saved = await repo.save(report);
      logger.info(`Pothole report created with ID: ${saved.id}, Reference: ${referenceCode}`);
      return saved;
    } catch (error: any) {
      logger.error('Create pothole report error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create pothole report',
        details: error.message,
      };
    }
  }

  async getReportsByDeviceId(deviceId: string, filters?: { status?: ReportStatus }): Promise<PotholeReport[]> {
    try {
      const where: FindOptionsWhere<PotholeReport> = { deviceId };
      if (filters?.status) where.status = filters.status;

      const reports = await AppDataSource.getRepository(PotholeReport).find({
        where,
        order: { createdAt: 'DESC' },
      });
      return reports;
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

  async getReportsByUserEmail(userEmail: string, filters?: { status?: ReportStatus }): Promise<PotholeReport[]> {
    try {
      const where: FindOptionsWhere<PotholeReport> = { userEmail: userEmail.toLowerCase() };
      if (filters?.status) where.status = filters.status;

      const reports = await AppDataSource.getRepository(PotholeReport).find({
        where,
        order: { createdAt: 'DESC' },
      });
      return reports;
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

  async getReportById(reportId: string): Promise<PotholeReport> {
    try {
      const id = parseId(reportId);
      const report = await AppDataSource.getRepository(PotholeReport).findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      return report;
    } catch (error: any) {
      logger.error('Get report error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve report',
        details: error.message,
      };
    }
  }

  async listReports(query: ListReportsQuery): Promise<ListReportsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 10));
      const skip = (page - 1) * limit;

      const repo = AppDataSource.getRepository(PotholeReport);
      const qb = repo.createQueryBuilder('r');

      if (query.deviceId) qb.andWhere('r.deviceId = :deviceId', { deviceId: query.deviceId });
      if (query.region) qb.andWhere('r.region = :region', { region: query.region });
      if (query.town) qb.andWhere('r.town = :town', { town: query.town });
      if (query.severity) qb.andWhere('r.severity = :severity', { severity: query.severity });
      if (query.status) qb.andWhere('r.status = :status', { status: query.status });

      if (query.search) {
        qb.andWhere(
          '(r.referenceCode LIKE :search OR r.roadName LIKE :search OR r.town LIKE :search OR r.region LIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      if (query.startDate) {
        qb.andWhere('r.createdAt >= :startDate', { startDate: new Date(query.startDate) });
      }
      if (query.endDate) {
        qb.andWhere('r.createdAt <= :endDate', { endDate: new Date(query.endDate) });
      }

      const [reports, total] = await qb
        .orderBy('r.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        reports,
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

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    updates?: { assignedTo?: string; adminNotes?: string; severity?: Severity }
  ): Promise<PotholeReport> {
    try {
      logger.info(`Updating report status: ${reportId} to ${status}`);

      const id = parseId(reportId);
      const repo = AppDataSource.getRepository(PotholeReport);
      const report = await repo.findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      report.status = status;
      if (updates?.assignedTo !== undefined) report.assignedTo = updates.assignedTo;
      if (updates?.adminNotes !== undefined) report.adminNotes = updates.adminNotes;
      if (updates?.severity !== undefined) report.severity = updates.severity;
      if (status === 'fixed' && !report.fixedAt) report.fixedAt = new Date();

      const saved = await repo.save(report);
      logger.info(`Report ${reportId} status updated to ${status}`);
      return saved;
    } catch (error: any) {
      logger.error('Update report status error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update report status',
        details: error.message,
      };
    }
  }

  async assignReport(reportId: string, assignedTo: string): Promise<PotholeReport> {
    try {
      logger.info(`Assigning report ${reportId} to ${assignedTo}`);

      const id = parseId(reportId);
      const repo = AppDataSource.getRepository(PotholeReport);
      const report = await repo.findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      report.assignedTo = assignedTo;
      report.status = 'assigned';
      return repo.save(report);
    } catch (error: any) {
      logger.error('Assign report error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to assign report',
        details: error.message,
      };
    }
  }

  async addAdminNotes(reportId: string, adminNotes: string): Promise<PotholeReport> {
    try {
      logger.info(`Adding admin notes to report ${reportId}`);

      const id = parseId(reportId);
      const repo = AppDataSource.getRepository(PotholeReport);
      const report = await repo.findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      report.adminNotes = adminNotes;
      return repo.save(report);
    } catch (error: any) {
      logger.error('Add admin notes error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to add admin notes',
        details: error.message,
      };
    }
  }

  async markAsFixed(reportId: string, repairPhotoFile?: Express.Multer.File): Promise<PotholeReport> {
    try {
      logger.info(`Marking report ${reportId} as fixed`);

      const id = parseId(reportId);
      const repo = AppDataSource.getRepository(PotholeReport);
      const report = await repo.findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      report.status = 'fixed';
      report.fixedAt = new Date();
      if (repairPhotoFile) {
        const photoUpload = await uploadService.uploadImage(repairPhotoFile);
        report.repairPhotoUrl = photoUpload.url;
      }

      return repo.save(report);
    } catch (error: any) {
      logger.error('Mark as fixed error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to mark report as fixed',
        details: error.message,
      };
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      logger.info(`Deleting report: ${reportId}`);

      const id = parseId(reportId);
      const repo = AppDataSource.getRepository(PotholeReport);
      const report = await repo.findOne({ where: { id } });

      if (!report) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Pothole report not found',
        };
      }

      if (report.photoUrl && fileStorageService.isBackendFileUrl(report.photoUrl)) {
        try {
          const fileId = fileStorageService.extractIdFromUrl(report.photoUrl);
          if (fileId) {
            await fileStorageService.deleteFile(fileId);
            logger.info(`Deleted photo from storage: id=${fileId}`);
          }
        } catch (error) {
          logger.warn(`Failed to delete photo from storage: ${error}`);
        }
      }

      if (report.repairPhotoUrl && fileStorageService.isBackendFileUrl(report.repairPhotoUrl)) {
        try {
          const fileId = fileStorageService.extractIdFromUrl(report.repairPhotoUrl);
          if (fileId) {
            await fileStorageService.deleteFile(fileId);
            logger.info(`Deleted repair photo from storage: id=${fileId}`);
          }
        } catch (error) {
          logger.warn(`Failed to delete repair photo from storage: ${error}`);
        }
      }

      await repo.remove(report);
      logger.info(`Report ${reportId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete report error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete report',
        details: error.message,
      };
    }
  }

  async getRegionsAndTowns(): Promise<{ regions: string[]; towns: string[] }> {
    try {
      const repo = AppDataSource.getRepository(PotholeReport);
      const regionsRows = await repo
        .createQueryBuilder('r')
        .select('DISTINCT r.region', 'region')
        .where("r.region IS NOT NULL AND r.region != '' AND r.region != 'Unknown'")
        .getRawMany();
      const townsRows = await repo
        .createQueryBuilder('r')
        .select('DISTINCT r.town', 'town')
        .where("r.town IS NOT NULL AND r.town != '' AND r.town != 'Unknown'")
        .getRawMany();

      const regions = (regionsRows as { region: string }[]).map((r) => r.region).filter(Boolean).sort();
      const towns = (townsRows as { town: string }[]).map((t) => t.town).filter(Boolean).sort();
      return { regions, towns };
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
