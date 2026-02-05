"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.potholeReportsService = void 0;
const db_1 = require("../../config/db");
const pothole_reports_entity_1 = require("./pothole-reports.entity");
const upload_service_1 = require("../upload/upload.service");
const geocoding_1 = require("../../utils/geocoding");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
function parseId(reportId) {
    const id = parseInt(reportId, 10);
    if (isNaN(id)) {
        throw {
            statusCode: 404,
            code: errors_1.ERROR_CODES.NOT_FOUND,
            message: 'Pothole report not found',
        };
    }
    return id;
}
class PotholeReportsService {
    generateReferenceCode() {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(100000 + Math.random() * 900000);
        return `RA-PT-${dateStr}-${random}`;
    }
    async createReport(dto, photoFile) {
        try {
            logger_1.logger.info('Creating pothole report:', { deviceId: dto.deviceId, roadName: dto.roadName });
            const photoUpload = await upload_service_1.uploadService.uploadImage(photoFile);
            let town = dto.townName || '';
            let region = '';
            if (!town) {
                const geocodeResult = await (0, geocoding_1.reverseGeocode)(dto.location.latitude, dto.location.longitude);
                town = geocodeResult.town;
                region = geocodeResult.region;
            }
            else {
                try {
                    const geocodeResult = await (0, geocoding_1.reverseGeocode)(dto.location.latitude, dto.location.longitude);
                    region = geocodeResult.region;
                }
                catch (error) {
                    logger_1.logger.warn('Failed to get region from reverse geocoding:', error);
                    region = 'Unknown';
                }
            }
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            let referenceCode = this.generateReferenceCode();
            let attempts = 0;
            while (attempts < 10) {
                const existing = await repo.findOne({ where: { referenceCode } });
                if (!existing)
                    break;
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
            logger_1.logger.info(`Pothole report created with ID: ${saved.id}, Reference: ${referenceCode}`);
            return saved;
        }
        catch (error) {
            logger_1.logger.error('Create pothole report error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create pothole report',
                details: error.message,
            };
        }
    }
    async getReportsByDeviceId(deviceId, filters) {
        try {
            const where = { deviceId };
            if (filters?.status)
                where.status = filters.status;
            const reports = await db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport).find({
                where,
                order: { createdAt: 'DESC' },
            });
            return reports;
        }
        catch (error) {
            logger_1.logger.error('Get reports by device ID error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve reports',
                details: error.message,
            };
        }
    }
    async getReportsByUserEmail(userEmail, filters) {
        try {
            const where = { userEmail: userEmail.toLowerCase() };
            if (filters?.status)
                where.status = filters.status;
            const reports = await db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport).find({
                where,
                order: { createdAt: 'DESC' },
            });
            return reports;
        }
        catch (error) {
            logger_1.logger.error('Get reports by user email error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve reports',
                details: error.message,
            };
        }
    }
    async getReportById(reportId) {
        try {
            const id = parseId(reportId);
            const report = await db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport).findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            return report;
        }
        catch (error) {
            logger_1.logger.error('Get report error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve report',
                details: error.message,
            };
        }
    }
    async listReports(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const qb = repo.createQueryBuilder('r');
            if (query.deviceId)
                qb.andWhere('r.deviceId = :deviceId', { deviceId: query.deviceId });
            if (query.region)
                qb.andWhere('r.region = :region', { region: query.region });
            if (query.town)
                qb.andWhere('r.town = :town', { town: query.town });
            if (query.severity)
                qb.andWhere('r.severity = :severity', { severity: query.severity });
            if (query.status)
                qb.andWhere('r.status = :status', { status: query.status });
            if (query.search) {
                qb.andWhere('(r.referenceCode LIKE :search OR r.roadName LIKE :search OR r.town LIKE :search OR r.region LIKE :search)', { search: `%${query.search}%` });
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
        }
        catch (error) {
            logger_1.logger.error('List reports error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve reports',
                details: error.message,
            };
        }
    }
    async updateReportStatus(reportId, status, updates) {
        try {
            logger_1.logger.info(`Updating report status: ${reportId} to ${status}`);
            const id = parseId(reportId);
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const report = await repo.findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            report.status = status;
            if (updates?.assignedTo !== undefined)
                report.assignedTo = updates.assignedTo;
            if (updates?.adminNotes !== undefined)
                report.adminNotes = updates.adminNotes;
            if (updates?.severity !== undefined)
                report.severity = updates.severity;
            if (status === 'fixed' && !report.fixedAt)
                report.fixedAt = new Date();
            const saved = await repo.save(report);
            logger_1.logger.info(`Report ${reportId} status updated to ${status}`);
            return saved;
        }
        catch (error) {
            logger_1.logger.error('Update report status error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update report status',
                details: error.message,
            };
        }
    }
    async assignReport(reportId, assignedTo) {
        try {
            logger_1.logger.info(`Assigning report ${reportId} to ${assignedTo}`);
            const id = parseId(reportId);
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const report = await repo.findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            report.assignedTo = assignedTo;
            report.status = 'assigned';
            return repo.save(report);
        }
        catch (error) {
            logger_1.logger.error('Assign report error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to assign report',
                details: error.message,
            };
        }
    }
    async addAdminNotes(reportId, adminNotes) {
        try {
            logger_1.logger.info(`Adding admin notes to report ${reportId}`);
            const id = parseId(reportId);
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const report = await repo.findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            report.adminNotes = adminNotes;
            return repo.save(report);
        }
        catch (error) {
            logger_1.logger.error('Add admin notes error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to add admin notes',
                details: error.message,
            };
        }
    }
    async markAsFixed(reportId, repairPhotoFile) {
        try {
            logger_1.logger.info(`Marking report ${reportId} as fixed`);
            const id = parseId(reportId);
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const report = await repo.findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            report.status = 'fixed';
            report.fixedAt = new Date();
            if (repairPhotoFile) {
                const photoUpload = await upload_service_1.uploadService.uploadImage(repairPhotoFile);
                report.repairPhotoUrl = photoUpload.url;
            }
            return repo.save(report);
        }
        catch (error) {
            logger_1.logger.error('Mark as fixed error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to mark report as fixed',
                details: error.message,
            };
        }
    }
    async deleteReport(reportId) {
        try {
            logger_1.logger.info(`Deleting report: ${reportId}`);
            const id = parseId(reportId);
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
            const report = await repo.findOne({ where: { id } });
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            if (report.photoUrl) {
                try {
                    const urlParts = report.photoUrl.split('/');
                    const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
                    const publicId = publicIdWithExt.replace('roads-authority/', '');
                    await upload_service_1.uploadService.deleteImage(`roads-authority/${publicId}`);
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to delete photo from Cloudinary: ${error}`);
                }
            }
            if (report.repairPhotoUrl) {
                try {
                    const urlParts = report.repairPhotoUrl.split('/');
                    const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
                    const publicId = publicIdWithExt.replace('roads-authority/', '');
                    await upload_service_1.uploadService.deleteImage(`roads-authority/${publicId}`);
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to delete repair photo from Cloudinary: ${error}`);
                }
            }
            await repo.remove(report);
            logger_1.logger.info(`Report ${reportId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete report error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete report',
                details: error.message,
            };
        }
    }
    async getRegionsAndTowns() {
        try {
            const repo = db_1.AppDataSource.getRepository(pothole_reports_entity_1.PotholeReport);
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
            const regions = regionsRows.map((r) => r.region).filter(Boolean).sort();
            const towns = townsRows.map((t) => t.town).filter(Boolean).sort();
            return { regions, towns };
        }
        catch (error) {
            logger_1.logger.error('Get regions and towns error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve regions and towns',
                details: error.message,
            };
        }
    }
}
exports.potholeReportsService = new PotholeReportsService();
//# sourceMappingURL=pothole-reports.service.js.map