import { AppDataSource } from '../../config/db';
import { FileStorage } from './file-storage.entity';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface StoreFileResult {
  id: number;
  url: string;
}

export interface GetFileResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

class FileStorageService {
  /**
   * Store file in database and return ID and URL
   */
  async storeFile(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StoreFileResult> {
    const repo = AppDataSource.getRepository(FileStorage);
    const entity = repo.create({
      filename,
      mimeType,
      size: buffer.length,
      data: buffer,
    });
    const saved = await repo.save(entity);
    const url = `${env.BACKEND_PUBLIC_URL.replace(/\/$/, '')}/api/files/${saved.id}`;
    logger.info(`Stored file: ${filename} (id=${saved.id}, size=${buffer.length})`);
    return { id: saved.id, url };
  }

  /**
   * Get file from database by ID
   */
  async getFile(id: number): Promise<GetFileResult | null> {
    const repo = AppDataSource.getRepository(FileStorage);
    const entity = await repo.findOne({ where: { id } });
    if (!entity) return null;
    return {
      buffer: entity.data,
      mimeType: entity.mimeType,
      filename: entity.filename,
    };
  }

  /**
   * Delete file from database by ID
   */
  async deleteFile(id: number): Promise<boolean> {
    const repo = AppDataSource.getRepository(FileStorage);
    const result = await repo.delete({ id });
    const deleted = (result.affected ?? 0) > 0;
    if (deleted) {
      logger.info(`Deleted file from storage: id=${id}`);
    }
    return deleted;
  }

  /**
   * Extract file ID from backend file URL (e.g. /api/files/123 or full URL)
   */
  extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/api\/files\/(\d+)(?:\?|$)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Check if URL is a backend-stored file URL
   */
  isBackendFileUrl(url: string): boolean {
    return /\/api\/files\/\d+/.test(url);
  }
}

export const fileStorageService = new FileStorageService();
