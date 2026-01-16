import { Router } from 'express';
import { roadworksController } from './roadworks.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

// Public: planned/ongoing roadworks
router.get('/public', roadworksController.listPublic.bind(roadworksController));

// Admin routes
router.post(
  '/',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.create.bind(roadworksController)
);

router.get(
  '/',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.list.bind(roadworksController)
);

router.get(
  '/:id',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.getById.bind(roadworksController)
);

router.put(
  '/:id',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.update.bind(roadworksController)
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.delete.bind(roadworksController)
);

export default router;













