import { Router } from 'express';
import { incidentsController } from './incidents.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

// Public: active incidents for citizens/chatbot
router.get('/public', incidentsController.listPublic.bind(incidentsController));

// Admin routes
router.post(
  '/',
  authenticate,
  requirePermission('incidents:manage'),
  incidentsController.create.bind(incidentsController)
);

router.get(
  '/',
  authenticate,
  requirePermission('incidents:manage'),
  incidentsController.list.bind(incidentsController)
);

router.get(
  '/:id',
  authenticate,
  requirePermission('incidents:manage'),
  incidentsController.getById.bind(incidentsController)
);

router.put(
  '/:id',
  authenticate,
  requirePermission('incidents:manage'),
  incidentsController.update.bind(incidentsController)
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('incidents:manage'),
  incidentsController.delete.bind(incidentsController)
);

export default router;

