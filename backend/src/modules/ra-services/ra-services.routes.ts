import { Router } from 'express';
import { RAServicesController } from './ra-services.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth';

const router = Router();
const raServicesController = new RAServicesController();

// Public routes (for mobile app)
router.get('/', raServicesController.listServices.bind(raServicesController));
router.get('/:id', raServicesController.getService.bind(raServicesController));

// Admin routes
router.post('/', authenticate, requireAdmin, raServicesController.createService.bind(raServicesController));
router.put('/:id', authenticate, requireAdmin, raServicesController.updateService.bind(raServicesController));
router.delete('/:id', authenticate, requireAdmin, raServicesController.deleteService.bind(raServicesController));

export default router;
