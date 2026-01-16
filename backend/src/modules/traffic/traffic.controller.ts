import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from '../../constants/errors';
import { logger } from '../../utils/logger';
import { trafficService } from './traffic.service';
import { TrafficQueryType } from './traffic.types';

class TrafficController {
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.query as string) || (req.query.q as string);
      const type = (req.query.type as TrafficQueryType) || undefined;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_INVALID_INPUT,
            message: 'Query is required (e.g., road, area, or landmark name)',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const data = await trafficService.getTrafficStatus({
        query,
        type: this.parseType(type),
      });

      res.status(200).json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Traffic status controller error', error);
      next(error);
    }
  }

  private parseType(type?: TrafficQueryType): TrafficQueryType | undefined {
    if (!type) return undefined;
    if (type === 'road' || type === 'area' || type === 'landmark') {
      return type;
    }
    return undefined;
  }
}

export const trafficController = new TrafficController();











