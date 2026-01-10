"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procurement_awards_controller_1 = require("./procurement-awards.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const uploadMultiple_1 = require("../../middlewares/uploadMultiple");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/procurement-awards
 * @desc    Create a new procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_AWARDS_MANAGE), procurement_awards_controller_1.procurementAwardController.createAward.bind(procurement_awards_controller_1.procurementAwardController));
/**
 * @route   GET /api/procurement-awards
 * @desc    List all procurement awards with pagination, filtering, and search
 * @access  Public (mobile app users can view published awards)
 */
router.get('/', procurement_awards_controller_1.procurementAwardController.listAwards.bind(procurement_awards_controller_1.procurementAwardController));
/**
 * @route   GET /api/procurement-awards/:id
 * @desc    Get a single procurement award by ID
 * @access  Public (mobile app users can view published awards)
 */
router.get('/:id', procurement_awards_controller_1.procurementAwardController.getAward.bind(procurement_awards_controller_1.procurementAwardController));
/**
 * @route   PUT /api/procurement-awards/:id
 * @desc    Update a procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_AWARDS_MANAGE), procurement_awards_controller_1.procurementAwardController.updateAward.bind(procurement_awards_controller_1.procurementAwardController));
/**
 * @route   DELETE /api/procurement-awards/:id
 * @desc    Delete a procurement award
 * @access  Private (requires procurement:awards:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_AWARDS_MANAGE), procurement_awards_controller_1.procurementAwardController.deleteAward.bind(procurement_awards_controller_1.procurementAwardController));
/**
 * @route   POST /api/procurement-awards/bulk-upload
 * @desc    Upload multiple executive summary documents (max 10 files)
 * @access  Private (requires procurement:awards:manage permission)
 */
router.post('/bulk-upload', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_AWARDS_MANAGE), uploadMultiple_1.uploadMultiplePDFs.array('files', 10), uploadMultiple_1.handleMultipleUploadError, procurement_awards_controller_1.procurementAwardController.bulkUpload.bind(procurement_awards_controller_1.procurementAwardController));
exports.default = router;
//# sourceMappingURL=procurement-awards.routes.js.map