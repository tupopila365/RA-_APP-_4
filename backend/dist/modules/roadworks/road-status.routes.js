"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roadworks_controller_1 = require("./roadworks.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const roadworkValidation_1 = require("../../middlewares/roadworkValidation");
const router = (0, express_1.Router)();
/**
 * Road Status Routes - Alias for Roadworks
 *
 * These routes provide the same functionality as roadworks routes
 * but with the /road-status path that the admin panel expects.
 */
// Public: planned/ongoing roadworks (for mobile app)
router.get('/public', roadworks_controller_1.roadworksController.listPublic.bind(roadworks_controller_1.roadworksController));
// Admin routes (for admin panel)
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworkValidation_1.validateRoadworkCreate, roadworks_controller_1.roadworksController.create.bind(roadworks_controller_1.roadworksController));
router.get('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.list.bind(roadworks_controller_1.roadworksController));
router.get('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.getById.bind(roadworks_controller_1.roadworksController));
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworkValidation_1.validateRoadworkUpdate, roadworks_controller_1.roadworksController.update.bind(roadworks_controller_1.roadworksController));
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.delete.bind(roadworks_controller_1.roadworksController));
// Additional endpoints that admin panel might expect
router.put('/:id/publish', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), async (req, res, next) => {
    try {
        // Update roadwork to published status
        req.body = { published: true };
        await roadworks_controller_1.roadworksController.update(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/unpublish', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), async (req, res, next) => {
    try {
        // Update roadwork to unpublished status
        req.body = { published: false };
        await roadworks_controller_1.roadworksController.update(req, res, next);
    }
    catch (error) {
        next(error);
    }
});
// New endpoints for road closures with alternate routes
router.get('/road-closures/:id', roadworks_controller_1.roadworksController.getRoadClosureWithRoutes.bind(roadworks_controller_1.roadworksController));
router.post('/road-closures', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.createRoadClosureWithRoutes.bind(roadworks_controller_1.roadworksController));
router.put('/road-closures/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.updateRoadClosureWithRoutes.bind(roadworks_controller_1.roadworksController));
router.put('/:id/alternate-routes/:routeIndex/approve', auth_1.authenticate, (0, roleGuard_1.requirePermission)('roadworks:manage'), roadworks_controller_1.roadworksController.approveAlternateRoute.bind(roadworks_controller_1.roadworksController));
// Filters endpoint for regions (public - needed for form)
router.get('/filters/regions', async (req, res, next) => {
    try {
        // Return available regions from roadworks
        // This is a simplified implementation - you might want to create a proper service method
        res.status(200).json({
            success: true,
            data: {
                regions: [
                    'Khomas',
                    'Erongo',
                    'Hardap',
                    'Karas',
                    'Kunene',
                    'Ohangwena',
                    'Omaheke',
                    'Omusati',
                    'Oshana',
                    'Oshikoto',
                    'Otjozondjupa',
                    'Zambezi',
                    'Kavango East',
                    'Kavango West'
                ]
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=road-status.routes.js.map