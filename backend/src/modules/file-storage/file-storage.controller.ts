import { Request, Response, NextFunction } from 'express';
import { fileStorageService } from './file-storage.service';
import { logger } from '../../utils/logger';

export class FileStorageController {
  /**
   * Serve file by ID (no auth for RAG compatibility)
   */
  async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id < 1) {
        res.status(400).json({ success: false, message: 'Invalid file ID' });
        return;
      }

      const file = await fileStorageService.getFile(id);
      if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.setHeader('Content-Length', file.buffer.length);
      res.send(file.buffer);
    } catch (error) {
      logger.error('Error serving file:', error);
      next(error);
    }
  }
}

export const fileStorageController = new FileStorageController();
