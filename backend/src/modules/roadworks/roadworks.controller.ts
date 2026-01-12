import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { roadworksService, CreateRoadworkDTO, UpdateRoadworkDTO, ListRoadworksQuery } from './roadworks.service';

class RoadworksController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateRoadworkDTO;
      const roadwork = await roadworksService.createRoadwork(dto, req.user?.userId);
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
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const roadworks = await roadworksService.listRoadworks(query);
      res.status(200).json({ success: true, data: roadworks, timestamp: new Date().toISOString() });
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
      const roadwork = await roadworksService.updateRoadwork(req.params.id, dto, req.user?.userId);
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
}

export const roadworksController = new RoadworksController();








