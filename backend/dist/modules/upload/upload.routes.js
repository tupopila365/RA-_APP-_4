"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const upload_1 = require("../../middlewares/upload");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private (requires authentication)
 */
router.post('/image', auth_1.authenticate, upload_1.uploadImage.single('image'), upload_1.handleUploadError, upload_controller_1.uploadController.uploadImage.bind(upload_controller_1.uploadController));
/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private (requires authentication)
 */
router.delete('/image', auth_1.authenticate, upload_controller_1.uploadController.deleteImage.bind(upload_controller_1.uploadController));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map