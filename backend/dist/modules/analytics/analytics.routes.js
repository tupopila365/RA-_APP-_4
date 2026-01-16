"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// All analytics routes require authentication
router.use(auth_1.authenticate);
// Track chatbot interaction
router.post('/chatbot', analytics_controller_1.analyticsController.trackInteraction);
// Track user feedback
router.post('/feedback', analytics_controller_1.analyticsController.trackFeedback);
// Get analytics summary
router.get('/summary', analytics_controller_1.analyticsController.getAnalyticsSummary);
// Get improvement recommendations
router.get('/recommendations', analytics_controller_1.analyticsController.getRecommendations);
// Get real-time metrics
router.get('/realtime', analytics_controller_1.analyticsController.getRealtimeMetrics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map