import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { roadStatusService } from './road-status.service';

export class RoadStatusController {
  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || (req.query.query as string) || '';
      const items = await roadStatusService.listPublic(query);
      res.status(200).json({
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        region: req.query.region as string,
        status: req.query.status as string,
        search: req.query.search as string,
        published: req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const result = await roadStatusService.list(query);
      const roadworks = result.items.map((item) => ({ ...item, _id: String(item.id), id: item.id }));
      res.status(200).json({
        success: true,
        data: {
          roadworks,
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit: result.limit,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await roadStatusService.getById(req.params.id);
      if (!item) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Road status not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      const roadwork = { ...item, _id: String(item.id), id: item.id };
      res.status(200).json({
        success: true,
        data: { roadwork },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as {
        name?: string;
        region?: string;
        status?: string;
        lat?: number;
        lng?: number;
        notes?: string | null;
        published?: boolean;
      };
      const item = await roadStatusService.create({
        name: body.name ?? '',
        region: body.region ?? '',
        status: (body.status as any) ?? 'open',
        lat: body.lat ?? 0,
        lng: body.lng ?? 0,
        notes: body.notes,
        published: body.published,
      });
      const roadwork = { ...item, _id: String(item.id), id: item.id };
      res.status(201).json({
        success: true,
        data: { roadwork },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as {
        name?: string;
        region?: string;
        status?: string;
        lat?: number;
        lng?: number;
        notes?: string | null;
        published?: boolean;
      };
      const item = await roadStatusService.update(req.params.id, {
        name: body.name,
        region: body.region,
        status: body.status as any,
        lat: body.lat,
        lng: body.lng,
        notes: body.notes,
        published: body.published,
      });
      const roadwork = { ...item, _id: String(item.id), id: item.id };
      res.status(200).json({
        success: true,
        data: { roadwork },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await roadStatusService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Road status deleted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async publish(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await roadStatusService.setPublished(req.params.id, true);
      const roadwork = { ...item, _id: String(item.id), id: item.id };
      res.status(200).json({
        success: true,
        data: { roadwork },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async unpublish(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await roadStatusService.setPublished(req.params.id, false);
      const roadwork = { ...item, _id: String(item.id), id: item.id };
      res.status(200).json({
        success: true,
        data: { roadwork },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regions = await roadStatusService.getRegions();
      const defaultRegions = [
        'Khomas', 'Erongo', 'Hardap', 'ǁKaras', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati',
        'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi', 'Kavango East', 'Kavango West',
      ];
      const combined = Array.from(new Set([...regions, ...defaultRegions])).sort();
      res.status(200).json({
        success: true,
        data: { regions: combined },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roadStatusController = new RoadStatusController();
