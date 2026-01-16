import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { notificationsService } from './notifications.service';
import { PushTokenModel } from './notifications.model';
import { logger } from '../../utils/logger';

export class NotificationsController {
  /**
   * Register push token (public endpoint - no auth required)
   * POST /api/notifications/register
   */
  async registerToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pushToken, platform, deviceInfo } = req.body;
      
      if (!pushToken || !platform) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'pushToken and platform are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = await notificationsService.registerPushToken(
        pushToken,
        platform,
        deviceInfo || {}
      );

      logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);

      res.status(200).json({
        success: true,
        data: { tokenId: token._id },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Register token error:', error);
      next(error);
    }
  }

  /**
   * Send manual notification (requires auth)
   * POST /api/notifications/send
   */
  async sendNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, data, type, relatedId } = req.body;
      
      if (!title || !body || !type) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'title, body, and type are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await notificationsService.sendPushNotification({
        title,
        body,
        data,
        type,
        relatedId,
        sentBy: req.user?.userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Send notification error:', error);
      next(error);
    }
  }

  /**
   * Get notification logs (requires auth)
   * GET /api/notifications/logs
   */
  async getNotificationLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationsService.getNotificationLogs(page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get notification logs error:', error);
      next(error);
    }
  }

  /**
   * Get notification stats (requires auth)
   * GET /api/notifications/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activeTokens = await notificationsService.getActivePushTokensCount();

      res.status(200).json({
        success: true,
        data: { activeDevices: activeTokens },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get stats error:', error);
      next(error);
    }
  }

  /**
   * Get all registered tokens (for debugging - requires auth)
   * GET /api/notifications/tokens
   */
  async getTokens(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tokens = await PushTokenModel.find({ active: true })
        .select('pushToken platform deviceInfo createdAt lastUsed')
        .lean();

      res.status(200).json({
        success: true,
        data: {
          count: tokens.length,
          tokens: tokens.map(t => ({
            token: t.pushToken.substring(0, 30) + '...',
            platform: t.platform,
            deviceInfo: t.deviceInfo,
            registeredAt: t.createdAt,
            lastUsed: t.lastUsed,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get tokens error:', error);
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();

