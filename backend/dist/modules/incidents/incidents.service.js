"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentsService = exports.IncidentsService = void 0;
const incidents_model_1 = require("./incidents.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const cache_1 = require("../../utils/cache");
class IncidentsService {
    constructor() {
        this.cachePrefix = 'chatbot-incidents';
    }
    async invalidateCache() {
        await cache_1.cacheService.deleteAll(this.cachePrefix);
    }
    async createIncident(dto, userId) {
        try {
            const incident = await incidents_model_1.IncidentModel.create({
                ...dto,
                status: dto.status || 'Active',
                severity: dto.severity || 'Medium',
                reportedAt: dto.reportedAt || new Date(),
                createdBy: userId,
                updatedBy: userId,
            });
            await this.invalidateCache();
            return incident;
        }
        catch (error) {
            logger_1.logger.error('Create incident error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create incident',
                details: error.message,
            };
        }
    }
    async updateIncident(incidentId, dto, userId) {
        try {
            const incident = await incidents_model_1.IncidentModel.findByIdAndUpdate(incidentId, { ...dto, updatedBy: userId }, { new: true, runValidators: true }).lean();
            if (!incident) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Incident not found',
                };
            }
            await this.invalidateCache();
            return incident;
        }
        catch (error) {
            logger_1.logger.error('Update incident error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update incident',
                details: error.message,
            };
        }
    }
    async deleteIncident(incidentId) {
        try {
            const incident = await incidents_model_1.IncidentModel.findByIdAndDelete(incidentId);
            if (!incident) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Incident not found',
                };
            }
            await this.invalidateCache();
        }
        catch (error) {
            logger_1.logger.error('Delete incident error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete incident',
                details: error.message,
            };
        }
    }
    async getIncidentById(incidentId) {
        try {
            const incident = await incidents_model_1.IncidentModel.findById(incidentId).lean();
            if (!incident) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Incident not found',
                };
            }
            return incident;
        }
        catch (error) {
            logger_1.logger.error('Get incident error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve incident',
                details: error.message,
            };
        }
    }
    async listIncidents(query = {}) {
        try {
            const filter = {};
            if (query.status) {
                filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
            }
            if (query.road) {
                filter.road = new RegExp(query.road.trim(), 'i');
            }
            if (query.area) {
                filter.area = new RegExp(query.area.trim(), 'i');
            }
            if (query.type) {
                filter.type = query.type;
            }
            if (query.fromDate || query.toDate) {
                filter.reportedAt = {};
                if (query.fromDate) {
                    filter.reportedAt.$gte = query.fromDate;
                }
                if (query.toDate) {
                    filter.reportedAt.$lte = query.toDate;
                }
            }
            const limit = Math.min(200, Math.max(1, query.limit || 50));
            const incidents = await incidents_model_1.IncidentModel.find(filter)
                .sort({ reportedAt: -1, createdAt: -1 })
                .limit(limit)
                .lean();
            return incidents;
        }
        catch (error) {
            logger_1.logger.error('List incidents error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve incidents',
                details: error.message,
            };
        }
    }
    /**
     * Public-facing helper: find recent active incidents by road/area keywords for chatbot
     */
    async findActiveForQuery(term, limit = 3) {
        const filter = { status: 'Active' };
        if (term && term.trim()) {
            const regex = new RegExp(term.trim(), 'i');
            filter.$or = [{ road: regex }, { area: regex }, { locationDescription: regex }, { title: regex }];
        }
        const incidents = await incidents_model_1.IncidentModel.find(filter)
            .sort({ reportedAt: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        return incidents;
    }
}
exports.IncidentsService = IncidentsService;
exports.incidentsService = new IncidentsService();
//# sourceMappingURL=incidents.service.js.map