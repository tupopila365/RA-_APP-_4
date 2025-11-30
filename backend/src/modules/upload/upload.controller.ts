import { Request, Response, NextFunction } from 'express';
import { uploadService } from './upload.service';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../middlewares/auth';

export class UploadController {
  /**
   * Upload single image
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      logger.info(`Upload request received for file: ${req.file.originalname}`);

      const result = await uploadService.uploadImage(req.file);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in uploadImage controller:', error);
      
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
   * Upload single PDF
   */
  async uploadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      logger.info(`PDF upload request received for file: ${req.file.originalname}`);

      // Extract user info if available
      const userInfo = req.user ? {
        userId: req.user.userId,
        email: req.user.email,
      } : undefined;

      const result = await uploadService.uploadPDF(req.file, userInfo);

      res.status(200).json({
        success: true,
        message: 'PDF uploaded successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in uploadPDF controller:', error);
      
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
  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'Public ID is required',
        });
        return;
      }

      await uploadService.deleteImage(publicId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteImage controller:', error);
      next(error);
    }
  }

  /**
   * Delete PDF
   */
  async deletePDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({
          success: false,
          message: 'Public ID is required',
        });
        return;
      }

      // Extract user info if available
      const userInfo = req.user ? {
        userId: req.user.userId,
        email: req.user.email,
      } : undefined;

      await uploadService.deletePDF(publicId, userInfo);

      res.status(200).json({
        success: true,
        message: 'PDF deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deletePDF controller:', error);
      next(error);
    }
  }
}

export const uploadController = new UploadController();
