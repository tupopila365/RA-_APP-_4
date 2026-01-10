"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const traffic_controller_1 = require("./traffic.controller");
const router = (0, express_1.Router)();
/**
 * GET /api/traffic/status
 * Query real-time congestion for a road, area, or landmark
 * Public endpoint
 */
router.get('/status', traffic_controller_1.trafficController.getStatus.bind(traffic_controller_1.trafficController));
exports.default = router;
//# sourceMappingURL=traffic.routes.js.map