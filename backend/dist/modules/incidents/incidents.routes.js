"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidents_controller_1 = require("./incidents.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
// Public: active incidents for citizens/chatbot
router.get('/public', incidents_controller_1.incidentsController.listPublic.bind(incidents_controller_1.incidentsController));
// Admin routes
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('incidents:manage'), incidents_controller_1.incidentsController.create.bind(incidents_controller_1.incidentsController));
router.get('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('incidents:manage'), incidents_controller_1.incidentsController.list.bind(incidents_controller_1.incidentsController));
router.get('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('incidents:manage'), incidents_controller_1.incidentsController.getById.bind(incidents_controller_1.incidentsController));
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('incidents:manage'), incidents_controller_1.incidentsController.update.bind(incidents_controller_1.incidentsController));
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('incidents:manage'), incidents_controller_1.incidentsController.delete.bind(incidents_controller_1.incidentsController));
exports.default = router;
//# sourceMappingURL=incidents.routes.js.map