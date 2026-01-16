"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadworksController = void 0;
const roadworks_service_1 = require("./roadworks.service");
class RoadworksController {
    async create(req, res, next) {
        try {
            const dto = req.body;
            const roadwork = await roadworks_service_1.roadworksService.createRoadwork(dto, req.user?.userId, req.user?.email);
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
                region: req.query.region,
                search: req.query.search,
                published: req.query.published ? req.query.published === 'true' : undefined,
                priority: req.query.priority,
                fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
                toDate: req.query.toDate ? new Date(req.query.toDate) : undefined,
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            };
            const result = await roadworks_service_1.roadworksService.listRoadworks(query);
            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
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
            const roadwork = await roadworks_service_1.roadworksService.updateRoadwork(req.params.id, dto, req.user?.userId, req.user?.email);
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
    // New methods for road closures with alternate routes
    async getRoadClosureWithRoutes(req, res, next) {
        try {
            const roadwork = await roadworks_service_1.roadworksService.getRoadworkById(req.params.id);
            // Format response to match the expected structure
            const response = {
                roadClosure: roadwork.roadClosure || {
                    roadCode: roadwork.road,
                    startTown: roadwork.area?.split(' - ')[0],
                    endTown: roadwork.area?.split(' - ')[1],
                    startCoordinates: roadwork.coordinates,
                    endCoordinates: roadwork.coordinates,
                    polylineCoordinates: []
                },
                alternateRoutes: roadwork.alternateRoutes || []
            };
            res.status(200).json({ success: true, data: response, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async createRoadClosureWithRoutes(req, res, next) {
        try {
            const { roadClosure, alternateRoutes, ...roadworkData } = req.body;
            const dto = {
                ...roadworkData,
                roadClosure,
                alternateRoutes,
                status: 'Closed', // Default to closed for road closures
            };
            const roadwork = await roadworks_service_1.roadworksService.createRoadwork(dto, req.user?.userId, req.user?.email);
            res.status(201).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async updateRoadClosureWithRoutes(req, res, next) {
        try {
            const { roadClosure, alternateRoutes, ...roadworkData } = req.body;
            const dto = {
                ...roadworkData,
                roadClosure,
                alternateRoutes,
            };
            const roadwork = await roadworks_service_1.roadworksService.updateRoadwork(req.params.id, dto, req.user?.userId, req.user?.email);
            res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
    async approveAlternateRoute(req, res, next) {
        try {
            const { id, routeIndex } = req.params;
            const routeIdx = parseInt(routeIndex, 10);
            const roadwork = await roadworks_service_1.roadworksService.getRoadworkById(id);
            if (!roadwork.alternateRoutes || !roadwork.alternateRoutes[routeIdx]) {
                res.status(404).json({
                    success: false,
                    message: 'Alternate route not found',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            // Update the specific route's approval status
            roadwork.alternateRoutes[routeIdx].approved = true;
            const updatedRoadwork = await roadworks_service_1.roadworksService.updateRoadwork(id, { alternateRoutes: roadwork.alternateRoutes }, req.user?.userId, req.user?.email);
            res.status(200).json({ success: true, data: updatedRoadwork, timestamp: new Date().toISOString() });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.roadworksController = new RoadworksController();
//# sourceMappingURL=roadworks.controller.js.map