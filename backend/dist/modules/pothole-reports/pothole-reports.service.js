"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.potholeReportsService = void 0;
const pothole_reports_model_1 = require("./pothole-reports.model");
const upload_service_1 = require("../upload/upload.service");
const geocoding_1 = require("../../utils/geocoding");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class PotholeReportsService {
    /**
     * Generate unique reference code
     * Format: RA-PT-{YYYYMMDD}-{6digitRandom}
     */
    generateReferenceCode() {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random
        return `RA-PT-${dateStr}-${random}`;
    }
    /**
     * Create a new pothole report
     */
    async createReport(dto, photoFile) {
        try {
            logger_1.logger.info('Creating pothole report:', { deviceId: dto.deviceId, roadName: dto.roadName });
            // Upload photo to Cloudinary
            const photoUpload = await upload_service_1.uploadService.uploadImage(photoFile);
            // Reverse geocode location to get town and region
            const geocodeResult = await (0, geocoding_1.reverseGeocode)(dto.location.latitude, dto.location.longitude);
            // Generate unique reference code
            let referenceCode = this.generateReferenceCode();
            // Ensure uniqueness (retry if collision)
            let attempts = 0;
            while (attempts < 10) {
                const existing = await pothole_reports_model_1.PotholeReportModel.findOne({ referenceCode });
                if (!existing)
                    break;
                referenceCode = this.generateReferenceCode();
                attempts++;
            }
            // Create report
            const report = await pothole_reports_model_1.PotholeReportModel.create({
                deviceId: dto.deviceId,
                referenceCode,
                location: dto.location,
                town: geocodeResult.town,
                region: geocodeResult.region,
                roadName: dto.roadName,
                photoUrl: photoUpload.url,
                severity: dto.severity,
                description: dto.description,
                status: 'pending',
            });
            logger_1.logger.info(`Pothole report created with ID: ${report._id}, Reference: ${referenceCode}`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Create pothole report error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create pothole report',
                details: error.message,
            };
        }
    }
    /**
     * Get reports by device ID
     */
    async getReportsByDeviceId(deviceId, filters) {
        try {
            const filter = { deviceId };
            if (filters?.status) {
                filter.status = filters.status;
            }
            const reports = await pothole_reports_model_1.PotholeReportModel.find(filter)
                .sort({ createdAt: -1 })
                .lean();
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
    /**
     * Get a single report by ID
     */
    async getReportById(reportId) {
        try {
            const report = await pothole_reports_model_1.PotholeReportModel.findById(reportId).lean();
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
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve report',
                details: error.message,
            };
        }
    }
    /**
     * List reports with pagination and filtering (admin)
     */
    async listReports(query) {
        try {
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 10));
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
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
                pothole_reports_model_1.PotholeReportModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                pothole_reports_model_1.PotholeReportModel.countDocuments(filter),
            ]);
            return {
                reports: reports,
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
    /**
     * Update report status
     */
    async updateReportStatus(reportId, status, updates) {
        try {
            logger_1.logger.info(`Updating report status: ${reportId} to ${status}`);
            const updateData = { status };
            if (updates?.assignedTo !== undefined) {
                updateData.assignedTo = updates.assignedTo;
            }
            if (updates?.adminNotes !== undefined) {
                updateData.adminNotes = updates.adminNotes;
            }
            const report = await pothole_reports_model_1.PotholeReportModel.findByIdAndUpdate(reportId, updateData, { new: true, runValidators: true }).lean();
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            logger_1.logger.info(`Report ${reportId} status updated to ${status}`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Update report status error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update report status',
                details: error.message,
            };
        }
    }
    /**
     * Assign report to maintenance team
     */
    async assignReport(reportId, assignedTo) {
        try {
            logger_1.logger.info(`Assigning report ${reportId} to ${assignedTo}`);
            const report = await pothole_reports_model_1.PotholeReportModel.findByIdAndUpdate(reportId, {
                assignedTo,
                status: 'assigned',
            }, { new: true, runValidators: true }).lean();
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            logger_1.logger.info(`Report ${reportId} assigned to ${assignedTo}`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Assign report error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to assign report',
                details: error.message,
            };
        }
    }
    /**
     * Add admin notes to report
     */
    async addAdminNotes(reportId, adminNotes) {
        try {
            logger_1.logger.info(`Adding admin notes to report ${reportId}`);
            const report = await pothole_reports_model_1.PotholeReportModel.findByIdAndUpdate(reportId, { adminNotes }, { new: true, runValidators: true }).lean();
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            logger_1.logger.info(`Admin notes added to report ${reportId}`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Add admin notes error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to add admin notes',
                details: error.message,
            };
        }
    }
    /**
     * Mark report as fixed
     */
    async markAsFixed(reportId, repairPhotoFile) {
        try {
            logger_1.logger.info(`Marking report ${reportId} as fixed`);
            const updateData = {
                status: 'fixed',
            };
            // Upload repair photo if provided
            if (repairPhotoFile) {
                const photoUpload = await upload_service_1.uploadService.uploadImage(repairPhotoFile);
                updateData.repairPhotoUrl = photoUpload.url;
            }
            const report = await pothole_reports_model_1.PotholeReportModel.findByIdAndUpdate(reportId, updateData, { new: true, runValidators: true }).lean();
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Pothole report not found',
                };
            }
            logger_1.logger.info(`Report ${reportId} marked as fixed`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Mark as fixed error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to mark report as fixed',
                details: error.message,
            };
        }
    }
    /**
     * Delete a report
     */
    async deleteReport(reportId) {
        try {
            logger_1.logger.info(`Deleting report: ${reportId}`);
            const report = await pothole_reports_model_1.PotholeReportModel.findById(reportId);
            if (!report) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
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
            await pothole_reports_model_1.PotholeReportModel.findByIdAndDelete(reportId);
            logger_1.logger.info(`Report ${reportId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete report error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete report',
                details: error.message,
            };
        }
    }
    /**
     * Get unique regions and towns for filtering
     */
    async getRegionsAndTowns() {
        try {
            const [regions, towns] = await Promise.all([
                pothole_reports_model_1.PotholeReportModel.distinct('region'),
                pothole_reports_model_1.PotholeReportModel.distinct('town'),
            ]);
            return {
                regions: regions.filter((r) => r && r !== 'Unknown').sort(),
                towns: towns.filter((t) => t && t !== 'Unknown').sort(),
            };
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