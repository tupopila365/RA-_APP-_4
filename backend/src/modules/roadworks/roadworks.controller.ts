import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { roadworksService, CreateRoadworkDTO, UpdateRoadworkDTO, ListRoadworksQuery } from './roadworks.service';

class RoadworksController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateRoadworkDTO;
      const roadwork = await roadworksService.createRoadwork(
        dto, 
        req.user?.userId,
        req.user?.email
      );
      res.status(201).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: ListRoadworksQuery = {
        status: req.query.status as any,
        road: req.query.road as string,
        area: req.query.area as string,
        region: req.query.region as string,
        search: req.query.search as string,
        published: req.query.published ? req.query.published === 'true' : undefined,
        priority: req.query.priority as any,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const result = await roadworksService.listRoadworks(query);
      res.status(200).json({ 
        success: true, 
        data: result,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      next(error);
    }
  }

  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const term = (req.query.q as string) || (req.query.query as string) || '';
      const roadworks = await roadworksService.findPublicForQuery(term || '');
      res.status(200).json({ success: true, data: roadworks, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadwork = await roadworksService.getRoadworkById(req.params.id);
      res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as UpdateRoadworkDTO;
      const roadwork = await roadworksService.updateRoadwork(
        req.params.id, 
        dto, 
        req.user?.userId,
        req.user?.email
      );
      res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await roadworksService.deleteRoadwork(req.params.id);
      res.status(200).json({ success: true, message: 'Roadwork deleted', timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  // New methods for road closures with alternate routes
  async getRoadClosureWithRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadwork = await roadworksService.getRoadworkById(req.params.id);
      
      // Format response to match the expected structure
      const response = {
        roadClosure: roadwork.roadClosure || {
          roadCode: roadwork.road,
          startTown: roadwork.area?.split(' - ')[0],
          endTown: roadwork.area?.split(' - ')[1],
          startCoordinates: roadwork.coordinates,
          endCoordinates: roadwork.coordinates,
          polylineCoordinates: []
        },
        alternateRoutes: roadwork.alternateRoutes || []
      };
      
      res.status(200).json({ success: true, data: response, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async createRoadClosureWithRoutes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roadClosure, alternateRoutes, ...roadworkData } = req.body;
      
      const dto: CreateRoadworkDTO = {
        ...roadworkData,
        roadClosure,
        alternateRoutes,
        status: 'Closed' as any, // Default to closed for road closures
      };
      
      const roadwork = await roadworksService.createRoadwork(
        dto, 
        req.user?.userId,
        req.user?.email
      );
      res.status(201).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async updateRoadClosureWithRoutes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roadClosure, alternateRoutes, ...roadworkData } = req.body;
      
      const dto: UpdateRoadworkDTO = {
        ...roadworkData,
        roadClosure,
        alternateRoutes,
      };
      
      const roadwork = await roadworksService.updateRoadwork(
        req.params.id, 
        dto, 
        req.user?.userId,
        req.user?.email
      );
      res.status(200).json({ success: true, data: roadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async approveAlternateRoute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, routeIndex } = req.params;
      const routeIdx = parseInt(routeIndex, 10);
      
      const roadwork = await roadworksService.getRoadworkById(id);
      
      if (!roadwork.alternateRoutes || !roadwork.alternateRoutes[routeIdx]) {
        res.status(404).json({ 
          success: false, 
          message: 'Alternate route not found',
          timestamp: new Date().toISOString() 
        });
        return;
      }
      
      // Update the specific route's approval status
      roadwork.alternateRoutes[routeIdx].approved = true;
      
      const updatedRoadwork = await roadworksService.updateRoadwork(
        id, 
        { alternateRoutes: roadwork.alternateRoutes }, 
        req.user?.userId,
        req.user?.email
      );
      
      res.status(200).json({ success: true, data: updatedRoadwork, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }
}

export const roadworksController = new RoadworksController();











