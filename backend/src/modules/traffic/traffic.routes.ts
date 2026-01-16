import { Router } from 'express';
import { trafficController } from './traffic.controller';

const router = Router();

/**
 * GET /api/traffic/status
 * Query real-time congestion for a road, area, or landmark
 * Public endpoint
 */
router.get('/status', trafficController.getStatus.bind(trafficController));

export default router;











