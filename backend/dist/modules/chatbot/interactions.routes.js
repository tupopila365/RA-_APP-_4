"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interactions_controller_1 = require("./interactions.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * PUT /api/chatbot/interactions/:id/feedback
 * Update feedback for an interaction
 * Public endpoint (no authentication required for mobile app users)
 */
router.put('/:id/feedback', interactions_controller_1.interactionsController.updateFeedback.bind(interactions_controller_1.interactionsController));
/**
 * GET /api/chatbot/interactions
 * List interactions with filtering and pagination
 * Admin only endpoint
 */
router.get('/', auth_1.authenticate, interactions_controller_1.interactionsController.listInteractions.bind(interactions_controller_1.interactionsController));
/**
 * GET /api/chatbot/interactions/metrics
 * Get metrics and statistics
 * Admin only endpoint
 */
router.get('/metrics', auth_1.authenticate, interactions_controller_1.interactionsController.getMetrics.bind(interactions_controller_1.interactionsController));
exports.default = router;
//# sourceMappingURL=interactions.routes.js.map