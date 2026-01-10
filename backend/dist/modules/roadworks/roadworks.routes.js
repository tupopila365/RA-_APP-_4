"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadworks_controller_1 = require("./roadworks.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
// Public: planned/ongoing roadworks
router.get('/public', roadworks_controller_1.roadworksController.listPublic.bind(roadworks_controller_1.roadworksController));
// Admin routes
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.create.bind(roadworks_controller_1.roadworksController));
router.get('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.list.bind(roadworks_controller_1.roadworksController));
router.get('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.getById.bind(roadworks_controller_1.roadworksController));
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.update.bind(roadworks_controller_1.roadworksController));
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.delete.bind(roadworks_controller_1.roadworksController));
exports.default = router;
//# sourceMappingURL=roadworks.routes.js.map