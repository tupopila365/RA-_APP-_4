"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.UploadController = void 0;
const upload_service_1 = require("./upload.service");
const logger_1 = require("../../utils/logger");
class UploadController {
    /**
     * Upload single image
     */
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file provided',
                });
                return;
            }
            logger_1.logger.info(`Upload request received for file: ${req.file.originalname}`);
            const result = await upload_service_1.uploadService.uploadImage(req.file);
            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in uploadImage controller:', error);
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }
    /**
     * Delete image
     */
    async deleteImage(req, res, next) {
        try {
            const { publicId } = req.body;
            if (!publicId) {
                res.status(400).json({
                    success: false,
                    message: 'Public ID is required',
                });
                return;
            }
            await upload_service_1.uploadService.deleteImage(publicId);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteImage controller:', error);
            next(error);
        }
    }
}
exports.UploadController = UploadController;
exports.uploadController = new UploadController();
//# sourceMappingURL=upload.controller.js.map