"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procurement_legislation_controller_1 = require("./procurement-legislation.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const uploadMultiple_1 = require("../../middlewares/uploadMultiple");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/procurement-legislation
 * @desc    Create a new procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE), procurement_legislation_controller_1.procurementLegislationController.createLegislation.bind(procurement_legislation_controller_1.procurementLegislationController));
/**
 * @route   GET /api/procurement-legislation
 * @desc    List all procurement legislation documents with pagination, filtering, and search
 * @access  Public (mobile app users can view published documents)
 */
router.get('/', procurement_legislation_controller_1.procurementLegislationController.listLegislation.bind(procurement_legislation_controller_1.procurementLegislationController));
/**
 * @route   GET /api/procurement-legislation/:id
 * @desc    Get a single procurement legislation document by ID
 * @access  Public (mobile app users can view published documents)
 */
router.get('/:id', procurement_legislation_controller_1.procurementLegislationController.getLegislation.bind(procurement_legislation_controller_1.procurementLegislationController));
/**
 * @route   PUT /api/procurement-legislation/:id
 * @desc    Update a procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE), procurement_legislation_controller_1.procurementLegislationController.updateLegislation.bind(procurement_legislation_controller_1.procurementLegislationController));
/**
 * @route   DELETE /api/procurement-legislation/:id
 * @desc    Delete a procurement legislation document
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE), procurement_legislation_controller_1.procurementLegislationController.deleteLegislation.bind(procurement_legislation_controller_1.procurementLegislationController));
/**
 * @route   POST /api/procurement-legislation/bulk-upload
 * @desc    Upload multiple procurement legislation documents (max 10 files)
 * @access  Private (requires procurement:legislation:manage permission)
 */
router.post('/bulk-upload', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_LEGISLATION_MANAGE), uploadMultiple_1.uploadMultiplePDFs.array('files', 10), uploadMultiple_1.handleMultipleUploadError, procurement_legislation_controller_1.procurementLegislationController.bulkUpload.bind(procurement_legislation_controller_1.procurementLegislationController));
exports.default = router;
//# sourceMappingURL=procurement-legislation.routes.js.map