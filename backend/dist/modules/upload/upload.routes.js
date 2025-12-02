"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const upload_1 = require("../../middlewares/upload");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const roles_1 = require("../../constants/roles");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.post('/image', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.DOCUMENTS_UPLOAD), upload_1.uploadImage.single('image'), upload_1.handleUploadError, upload_controller_1.uploadController.uploadImage.bind(upload_controller_1.uploadController));
/**
 * @route   POST /api/upload/pdf
 * @desc    Upload single PDF to Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.post('/pdf', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.DOCUMENTS_UPLOAD), upload_1.uploadPDF.single('file'), upload_1.handleUploadError, upload_controller_1.uploadController.uploadPDF.bind(upload_controller_1.uploadController));
/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.delete('/image', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.DOCUMENTS_UPLOAD), upload_controller_1.uploadController.deleteImage.bind(upload_controller_1.uploadController));
/**
 * @route   DELETE /api/upload/pdf
 * @desc    Delete PDF from Cloudinary
 * @access  Private (requires authentication and documents:upload permission)
 */
router.delete('/pdf', auth_1.authenticate, (0, roleGuard_1.requirePermission)(roles_1.PERMISSIONS.DOCUMENTS_UPLOAD), upload_controller_1.uploadController.deletePDF.bind(upload_controller_1.uploadController));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map