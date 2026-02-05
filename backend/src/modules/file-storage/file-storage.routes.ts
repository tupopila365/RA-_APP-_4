import { Router } from 'express';
import { fileStorageController } from './file-storage.controller';

const router = Router();

/**
 * @route   GET /api/files/:id
 * @desc    Serve file by ID (no auth - RAG service needs to fetch)
 * @access  Public
 */
router.get('/:id', fileStorageController.getFile.bind(fileStorageController));

export default router;
