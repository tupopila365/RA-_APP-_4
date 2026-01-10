"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procurement_plan_controller_1 = require("./procurement-plan.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const uploadMultiple_1 = require("../../middlewares/uploadMultiple");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/procurement-plan
 * @desc    Create a new procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_PLAN_MANAGE), procurement_plan_controller_1.procurementPlanController.createPlan.bind(procurement_plan_controller_1.procurementPlanController));
/**
 * @route   GET /api/procurement-plan
 * @desc    List all procurement plans with pagination, filtering, and search
 * @access  Public (mobile app users can view published plans)
 */
router.get('/', procurement_plan_controller_1.procurementPlanController.listPlans.bind(procurement_plan_controller_1.procurementPlanController));
/**
 * @route   GET /api/procurement-plan/:id
 * @desc    Get a single procurement plan by ID
 * @access  Public (mobile app users can view published plans)
 */
router.get('/:id', procurement_plan_controller_1.procurementPlanController.getPlan.bind(procurement_plan_controller_1.procurementPlanController));
/**
 * @route   PUT /api/procurement-plan/:id
 * @desc    Update a procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_PLAN_MANAGE), procurement_plan_controller_1.procurementPlanController.updatePlan.bind(procurement_plan_controller_1.procurementPlanController));
/**
 * @route   DELETE /api/procurement-plan/:id
 * @desc    Delete a procurement plan
 * @access  Private (requires procurement:plan:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_PLAN_MANAGE), procurement_plan_controller_1.procurementPlanController.deletePlan.bind(procurement_plan_controller_1.procurementPlanController));
/**
 * @route   POST /api/procurement-plan/bulk-upload
 * @desc    Upload multiple procurement plans (max 10 files)
 * @access  Private (requires procurement:plan:manage permission)
 */
router.post('/bulk-upload', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_PLAN_MANAGE), uploadMultiple_1.uploadMultiplePDFs.array('files', 10), uploadMultiple_1.handleMultipleUploadError, procurement_plan_controller_1.procurementPlanController.bulkUpload.bind(procurement_plan_controller_1.procurementPlanController));
exports.default = router;
//# sourceMappingURL=procurement-plan.routes.js.map