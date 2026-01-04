import { Request, Response, NextFunction } from 'express';
import { incidentsService, CreateIncidentDTO, UpdateIncidentDTO, ListIncidentsQuery } from './incidents.service';
import { AuthRequest } from '../../middlewares/auth';
import { ERROR_CODES } from '../../constants/errors';
import { logger } from '../../utils/logger';

class IncidentsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateIncidentDTO;
      const incident = await incidentsService.createIncident(dto, req.user?.userId);
      res.status(201).json({ success: true, data: incident, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: ListIncidentsQuery = {
        status: req.query.status as any,
        road: req.query.road as string,
        area: req.query.area as string,
        type: req.query.type as any,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const incidents = await incidentsService.listIncidents(query);
      res.status(200).json({ success: true, data: incidents, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const term = (req.query.q as string) || (req.query.query as string) || '';
      const incidents = await incidentsService.findActiveForQuery(term || '');
      res.status(200).json({ success: true, data: incidents, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await incidentsService.getIncidentById(req.params.id);
      res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as UpdateIncidentDTO;
      const incident = await incidentsService.updateIncident(req.params.id, dto, req.user?.userId);
      res.status(200).json({ success: true, data: incident, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await incidentsService.deleteIncident(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Incident deleted',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const incidentsController = new IncidentsController();

