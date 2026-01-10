"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentsController = void 0;
const incidents_service_1 = require("./incidents.service");
class IncidentsController {
    async create(req, res, next) {
        try {
            const dto = req.body;
            const incident = await incidents_service_1.incidentsService.createIncident(dto, req.user?.userId);
            res.status(201).json({ success: true, data: incident, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const query = {
                status: req.query.status,
                road: req.query.road,
                area: req.query.area,
                type: req.query.type,
                fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
                toDate: req.query.toDate ? new Date(req.query.toDate) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            };
            const incidents = await incidents_service_1.incidentsService.listIncidents(query);
            res.status(200).json({ success: true, data: incidents, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async listPublic(req, res, next) {
        try {
            const term = req.query.q || req.query.query || '';
            const incidents = await incidents_service_1.incidentsService.findActiveForQuery(term || '');
            res.status(200).json({ success: true, data: incidents, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const incident = await incidents_service_1.incidentsService.getIncidentById(req.params.id);
            res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const dto = req.body;
            const incident = await incidents_service_1.incidentsService.updateIncident(req.params.id, dto, req.user?.userId);
            res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await incidents_service_1.incidentsService.deleteIncident(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Incident deleted',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.incidentsController = new IncidentsController();
//# sourceMappingURL=incidents.controller.js.map