"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadworksController = void 0;
const roadworks_service_1 = require("./roadworks.service");
class RoadworksController {
    async create(req, res, next) {
        try {
            const dto = req.body;
            const roadwork = await roadworks_service_1.roadworksService.createRoadwork(dto, req.user?.userId);
            res.status(201).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
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
                fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
                toDate: req.query.toDate ? new Date(req.query.toDate) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            };
            const roadworks = await roadworks_service_1.roadworksService.listRoadworks(query);
            res.status(200).json({ success: true, data: roadworks, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async listPublic(req, res, next) {
        try {
            const term = req.query.q || req.query.query || '';
            const roadworks = await roadworks_service_1.roadworksService.findPublicForQuery(term || '');
            res.status(200).json({ success: true, data: roadworks, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const roadwork = await roadworks_service_1.roadworksService.getRoadworkById(req.params.id);
            res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const dto = req.body;
            const roadwork = await roadworks_service_1.roadworksService.updateRoadwork(req.params.id, dto, req.user?.userId);
            res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await roadworks_service_1.roadworksService.deleteRoadwork(req.params.id);
            res.status(200).json({ success: true, message: 'Roadwork deleted', timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.roadworksController = new RoadworksController();
//# sourceMappingURL=roadworks.controller.js.map