"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const locations_controller_1 = require("./locations.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/locations
 * @desc    Create a new location
 * @access  Private (requires locations:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('locations:manage'), locations_controller_1.locationsController.createLocation.bind(locations_controller_1.locationsController));
/**
 * @route   GET /api/locations
 * @desc    List all locations with optional region filtering
 * @access  Public (mobile app users can view locations)
 * @query   region - Optional region filter
 */
router.get('/', locations_controller_1.locationsController.listLocations.bind(locations_controller_1.locationsController));
/**
 * @route   GET /api/locations/:id
 * @desc    Get a single location by ID
 * @access  Public
 */
router.get('/:id', locations_controller_1.locationsController.getLocation.bind(locations_controller_1.locationsController));
/**
 * @route   PUT /api/locations/:id
 * @desc    Update a location
 * @access  Private (requires locations:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('locations:manage'), locations_controller_1.locationsController.updateLocation.bind(locations_controller_1.locationsController));
/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete a location
 * @access  Private (requires locations:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('locations:manage'), locations_controller_1.locationsController.deleteLocation.bind(locations_controller_1.locationsController));
exports.default = router;
//# sourceMappingURL=locations.routes.js.map