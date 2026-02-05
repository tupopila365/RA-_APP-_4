"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentsService = exports.IncidentsService = void 0;
const db_1 = require("../../config/db");
const incidents_entity_1 = require("./incidents.entity");
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
            const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
            const incident = repo.create({
                title: dto.title,
                type: dto.type,
                road: dto.road,
                locationDescription: dto.locationDescription,
                area: dto.area,
                status: dto.status || 'Active',
                severity: dto.severity || 'Medium',
                reportedAt: dto.reportedAt || new Date(),
                expectedClearance: dto.expectedClearance,
                coordinates: dto.coordinates,
                createdBy: userId ?? null,
                updatedBy: userId ?? null,
            });
            await repo.save(incident);
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
            const id = parseInt(incidentId, 10);
            const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
            const incident = await repo.findOne({ where: { id } });
            if (!incident) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
            }
            Object.assign(incident, dto, { updatedBy: userId });
            await repo.save(incident);
            await this.invalidateCache();
            return incident;
        }
        catch (error) {
            logger_1.logger.error('Update incident error:', error);
            if (error.statusCode)
                throw error;
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
            const id = parseInt(incidentId, 10);
            const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
            const incident = await repo.findOne({ where: { id } });
            if (!incident) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
            }
            await repo.remove(incident);
            await this.invalidateCache();
        }
        catch (error) {
            logger_1.logger.error('Delete incident error:', error);
            if (error.statusCode)
                throw error;
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
            const id = parseInt(incidentId, 10);
            const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
            const incident = await repo.findOne({ where: { id } });
            if (!incident) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Incident not found' };
            }
            return incident;
        }
        catch (error) {
            logger_1.logger.error('Get incident error:', error);
            if (error.statusCode)
                throw error;
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
            const limit = Math.min(200, Math.max(1, query.limit || 50));
            const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
            const qb = repo.createQueryBuilder('i');
            if (query.status) {
                const statuses = Array.isArray(query.status) ? query.status : [query.status];
                qb.andWhere('i.status IN (:...statuses)', { statuses });
            }
            if (query.road)
                qb.andWhere('i.road LIKE :road', { road: `%${query.road.trim()}%` });
            if (query.area)
                qb.andWhere('i.area LIKE :area', { area: `%${query.area.trim()}%` });
            if (query.type)
                qb.andWhere('i.type = :type', { type: query.type });
            if (query.fromDate)
                qb.andWhere('i.reportedAt >= :fromDate', { fromDate: query.fromDate });
            if (query.toDate)
                qb.andWhere('i.reportedAt <= :toDate', { toDate: query.toDate });
            const incidents = await qb
                .orderBy('i.reportedAt', 'DESC')
                .addOrderBy('i.createdAt', 'DESC')
                .take(limit)
                .getMany();
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
    async findActiveForQuery(term, limit = 3) {
        const repo = db_1.AppDataSource.getRepository(incidents_entity_1.Incident);
        const qb = repo
            .createQueryBuilder('i')
            .where('i.status = :status', { status: 'Active' })
            .orderBy('i.reportedAt', 'DESC')
            .addOrderBy('i.createdAt', 'DESC')
            .take(limit);
        if (term && term.trim()) {
            qb.andWhere('(i.road LIKE :term OR i.area LIKE :term OR i.locationDescription LIKE :term OR i.title LIKE :term)', { term: `%${term.trim()}%` });
        }
        return qb.getMany();
    }
}
exports.IncidentsService = IncidentsService;
exports.incidentsService = new IncidentsService();
//# sourceMappingURL=incidents.service.js.map