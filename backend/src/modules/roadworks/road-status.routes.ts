import { Router } from 'express';
import { roadworksController } from './roadworks.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';
import { validateRoadworkCreate, validateRoadworkUpdate } from '../../middlewares/roadworkValidation';

const router = Router();

/**
 * Road Status Routes - Alias for Roadworks
 * 
 * These routes provide the same functionality as roadworks routes
 * but with the /road-status path that the admin panel expects.
 */

// Public: planned/ongoing roadworks (for mobile app)
router.get('/public', roadworksController.listPublic.bind(roadworksController));

// Admin routes (for admin panel)
router.post(
  '/',
  authenticate,
  requirePermission('roadworks:manage'),
  validateRoadworkCreate,
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
  validateRoadworkUpdate,
  roadworksController.update.bind(roadworksController)
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.delete.bind(roadworksController)
);

// Additional endpoints that admin panel might expect
router.put(
  '/:id/publish',
  authenticate,
  requirePermission('roadworks:manage'),
  async (req, res, next) => {
    try {
      // Update roadwork to published status
      req.body = { published: true };
      await roadworksController.update(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id/unpublish',
  authenticate,
  requirePermission('roadworks:manage'),
  async (req, res, next) => {
    try {
      // Update roadwork to unpublished status
      req.body = { published: false };
      await roadworksController.update(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// New endpoints for road closures with alternate routes
router.get(
  '/road-closures/:id',
  roadworksController.getRoadClosureWithRoutes.bind(roadworksController)
);

router.post(
  '/road-closures',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.createRoadClosureWithRoutes.bind(roadworksController)
);

router.put(
  '/road-closures/:id',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.updateRoadClosureWithRoutes.bind(roadworksController)
);

router.put(
  '/:id/alternate-routes/:routeIndex/approve',
  authenticate,
  requirePermission('roadworks:manage'),
  roadworksController.approveAlternateRoute.bind(roadworksController)
);

// Filters endpoint for regions (public - needed for form)
router.get(
  '/filters/regions',
  async (req, res, next) => {
    try {
      // Return available regions from roadworks
      // This is a simplified implementation - you might want to create a proper service method
      res.status(200).json({
        success: true,
        data: {
          regions: [
            'Khomas',
            'Erongo',
            'Hardap',
            'Karas',
            'Kunene',
            'Ohangwena',
            'Omaheke',
            'Omusati',
            'Oshana',
            'Oshikoto',
            'Otjozondjupa',
            'Zambezi',
            'Kavango East',
            'Kavango West'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;