"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenders_controller_1 = require("./tenders.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/tenders
 * @desc    Create a new tender
 * @access  Private (requires tenders:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('tenders:manage'), tenders_controller_1.tendersController.createTender.bind(tenders_controller_1.tendersController));
/**
 * @route   GET /api/tenders
 * @desc    List all tenders with pagination, filtering, and search
 * @access  Public (mobile app users can view published tenders)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   status - Filter by tender status (open, closed, upcoming)
 * @query   category - Filter by category
 * @query   published - Filter by published status (true/false)
 * @query   search - Search in title and description
 */
router.get('/', tenders_controller_1.tendersController.listTenders.bind(tenders_controller_1.tendersController));
/**
 * @route   GET /api/tenders/:id
 * @desc    Get a single tender by ID
 * @access  Public (mobile app users can view published tenders)
 */
router.get('/:id', tenders_controller_1.tendersController.getTender.bind(tenders_controller_1.tendersController));
/**
 * @route   PUT /api/tenders/:id
 * @desc    Update a tender
 * @access  Private (requires tenders:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('tenders:manage'), tenders_controller_1.tendersController.updateTender.bind(tenders_controller_1.tendersController));
/**
 * @route   DELETE /api/tenders/:id
 * @desc    Delete a tender
 * @access  Private (requires tenders:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('tenders:manage'), tenders_controller_1.tendersController.deleteTender.bind(tenders_controller_1.tendersController));
exports.default = router;
//# sourceMappingURL=tenders.routes.js.map