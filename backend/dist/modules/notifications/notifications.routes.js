"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("./notifications.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Public route - no authentication required for token registration
router.post('/register', notifications_controller_1.notificationsController.registerToken.bind(notifications_controller_1.notificationsController));
// Protected routes - require authentication
router.use(auth_1.authenticate);
router.post('/send', notifications_controller_1.notificationsController.sendNotification.bind(notifications_controller_1.notificationsController));
router.get('/logs', notifications_controller_1.notificationsController.getNotificationLogs.bind(notifications_controller_1.notificationsController));
router.get('/stats', notifications_controller_1.notificationsController.getStats.bind(notifications_controller_1.notificationsController));
router.get('/tokens', notifications_controller_1.notificationsController.getTokens.bind(notifications_controller_1.notificationsController));
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map