import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { requireAnyPermission } from '../../middlewares/roleGuard';
import { roadStatusController } from './road-status.controller';

const roadStatusAdmin = requireAnyPermission(['road-status:manage', 'roadworks:manage']);

const router = Router();

/**
 * Road Status Routes - Simple model (name, region, status, lat, lng, notes, published).
 * Matches the mobile app and simplified admin.
 */

// Public: list published road status (for mobile app)
router.get('/public', roadStatusController.listPublic.bind(roadStatusController));

// Regions for admin filters (before /:id)
router.get('/filters/regions', roadStatusController.getRegions.bind(roadStatusController));

// Admin CRUD (accepts road-status:manage or roadworks:manage)
router.get('/', authenticate, roadStatusAdmin, roadStatusController.list.bind(roadStatusController));
router.post('/', authenticate, roadStatusAdmin, roadStatusController.create.bind(roadStatusController));
router.get('/:id', authenticate, roadStatusAdmin, roadStatusController.getById.bind(roadStatusController));
router.put('/:id', authenticate, roadStatusAdmin, roadStatusController.update.bind(roadStatusController));
router.delete('/:id', authenticate, roadStatusAdmin, roadStatusController.delete.bind(roadStatusController));
router.put('/:id/publish', authenticate, roadStatusAdmin, roadStatusController.publish.bind(roadStatusController));
router.put('/:id/unpublish', authenticate, roadStatusAdmin, roadStatusController.unpublish.bind(roadStatusController));

export default router;
