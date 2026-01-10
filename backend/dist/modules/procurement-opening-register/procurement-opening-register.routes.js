"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const procurement_opening_register_controller_1 = require("./procurement-opening-register.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const uploadMultiple_1 = require("../../middlewares/uploadMultiple");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/procurement-opening-register
 * @desc    Create a new procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE), procurement_opening_register_controller_1.procurementOpeningRegisterController.createItem.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
/**
 * @route   GET /api/procurement-opening-register
 * @desc    List all procurement opening register items with pagination, filtering, and search
 * @access  Public (mobile app users can view published items)
 */
router.get('/', procurement_opening_register_controller_1.procurementOpeningRegisterController.listItems.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
/**
 * @route   GET /api/procurement-opening-register/:id
 * @desc    Get a single procurement opening register item by ID
 * @access  Public (mobile app users can view published items)
 */
router.get('/:id', procurement_opening_register_controller_1.procurementOpeningRegisterController.getItem.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
/**
 * @route   PUT /api/procurement-opening-register/:id
 * @desc    Update a procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE), procurement_opening_register_controller_1.procurementOpeningRegisterController.updateItem.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
/**
 * @route   DELETE /api/procurement-opening-register/:id
 * @desc    Delete a procurement opening register item
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE), procurement_opening_register_controller_1.procurementOpeningRegisterController.deleteItem.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
/**
 * @route   POST /api/procurement-opening-register/bulk-upload
 * @desc    Upload multiple notice documents (max 10 files)
 * @access  Private (requires procurement:opening-register:manage permission)
 */
router.post('/bulk-upload', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.PROCUREMENT_OPENING_REGISTER_MANAGE), uploadMultiple_1.uploadMultiplePDFs.array('files', 10), uploadMultiple_1.handleMultipleUploadError, procurement_opening_register_controller_1.procurementOpeningRegisterController.bulkUpload.bind(procurement_opening_register_controller_1.procurementOpeningRegisterController));
exports.default = router;
//# sourceMappingURL=procurement-opening-register.routes.js.map