"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banners_controller_1 = require("./banners.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/banners
 * @desc    Create a new banner
 * @access  Private (requires banners:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('banners:manage'), banners_controller_1.bannersController.createBanner.bind(banners_controller_1.bannersController));
/**
 * @route   GET /api/banners
 * @desc    List all banners
 * @access  Public (mobile app users can view active banners)
 *          Private (admin users can view all banners)
 * @note    Returns only active banners for unauthenticated requests
 *          Returns all banners for authenticated admin requests
 */
router.get('/', banners_controller_1.bannersController.listBanners.bind(banners_controller_1.bannersController));
/**
 * @route   GET /api/banners/:id
 * @desc    Get a single banner by ID
 * @access  Public
 */
router.get('/:id', banners_controller_1.bannersController.getBanner.bind(banners_controller_1.bannersController));
/**
 * @route   PUT /api/banners/:id
 * @desc    Update a banner
 * @access  Private (requires banners:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('banners:manage'), banners_controller_1.bannersController.updateBanner.bind(banners_controller_1.bannersController));
/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete a banner
 * @access  Private (requires banners:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('banners:manage'), banners_controller_1.bannersController.deleteBanner.bind(banners_controller_1.bannersController));
exports.default = router;
//# sourceMappingURL=banners.routes.js.map