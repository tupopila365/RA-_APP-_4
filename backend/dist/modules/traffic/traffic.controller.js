"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trafficController = void 0;
const errors_1 = require("../../constants/errors");
const logger_1 = require("../../utils/logger");
const traffic_service_1 = require("./traffic.service");
class TrafficController {
    async getStatus(req, res, next) {
        try {
            const query = req.query.query || req.query.q;
            const type = req.query.type || undefined;
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_INVALID_INPUT,
                        message: 'Query is required (e.g., road, area, or landmark name)',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const data = await traffic_service_1.trafficService.getTrafficStatus({
                query,
                type: this.parseType(type),
            });
            res.status(200).json({
                success: true,
                data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Traffic status controller error', error);
            next(error);
        }
    }
    parseType(type) {
        if (!type)
            return undefined;
        if (type === 'road' || type === 'area' || type === 'landmark') {
            return type;
        }
        return undefined;
    }
}
exports.trafficController = new TrafficController();
//# sourceMappingURL=traffic.controller.js.map