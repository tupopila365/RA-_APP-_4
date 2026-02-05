import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { AppDataSource } from '../../config/db';
import { PushToken, NotificationLog } from './notifications.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface SendNotificationDTO {
  title: string;
  body: string;
  data?: any;
  type: 'news' | 'tender' | 'vacancy' | 'general';
  relatedId?: string;
  sentBy?: string;
}

class NotificationsService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async registerPushToken(
    pushToken: string,
    platform: 'ios' | 'android',
    deviceInfo: any,
    userId?: string
  ): Promise<PushToken> {
    try {
      if (!Expo.isExpoPushToken(pushToken)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Expo push token',
        };
      }

      const repo = AppDataSource.getRepository(PushToken);
      let token = await repo.findOne({ where: { pushToken } });

      if (token) {
        token.platform = platform;
        token.deviceInfo = deviceInfo;
        token.active = true;
        token.lastUsed = new Date();
        if (userId) token.userId = parseInt(userId, 10);
        await repo.save(token);
      } else {
        token = repo.create({
          pushToken,
          platform,
          deviceInfo,
          userId: userId ? parseInt(userId, 10) : null,
          active: true,
          lastUsed: new Date(),
        });
        await repo.save(token);
      }

      logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);
      return token;
    } catch (error: any) {
      logger.error('Register push token error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to register push token',
        details: error.message,
      };
    }
  }

  async sendPushNotification(dto: SendNotificationDTO, pushTokens?: string[]): Promise<any> {
    try {
      let tokens: string[];

      if (pushTokens && pushTokens.length > 0) {
        tokens = pushTokens;
      } else {
        const repo = AppDataSource.getRepository(PushToken);
        const tokenDocs = await repo.find({ where: { active: true } });
        tokens = tokenDocs.map((doc) => doc.pushToken);
      }

      if (tokens.length === 0) {
        logger.warn('No push tokens available to send notification');
        return { sentCount: 0, failedCount: 0, message: 'No recipients available' };
      }

      const messages: ExpoPushMessage[] = [];
      for (const pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          logger.warn(`Invalid push token: ${pushToken}`);
          continue;
        }
        messages.push({
          to: pushToken,
          sound: 'default',
          title: dto.title,
          body: dto.body,
          data: dto.data || {},
          priority: 'high',
        });
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error('Error sending push notification chunk:', error);
        }
      }

      let sentCount = 0;
      let failedCount = 0;
      for (const ticket of tickets) {
        if (ticket.status === 'ok') sentCount++;
        else {
          failedCount++;
          logger.error('Push notification error:', ticket);
        }
      }

      const logRepo = AppDataSource.getRepository(NotificationLog);
      const log = logRepo.create({
        title: dto.title,
        body: dto.body,
        data: dto.data,
        recipients: tokens,
        sentCount,
        failedCount,
        type: dto.type,
        relatedId: dto.relatedId,
        sentById: dto.sentBy ? parseInt(dto.sentBy, 10) : null,
        sentAt: new Date(),
      });
      await logRepo.save(log);

      logger.info(`Sent ${sentCount} notifications, ${failedCount} failed`);
      return { sentCount, failedCount, totalRecipients: tokens.length };
    } catch (error: any) {
      logger.error('Send push notification error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Failed to send push notification',
        details: error.message,
      };
    }
  }

  async sendNewsNotification(newsId: string, title: string, excerpt: string): Promise<any> {
    return this.sendPushNotification({
      title: 'New News Article',
      body: title,
      data: { type: 'news', newsId, screen: 'NewsDetail' },
      type: 'news',
      relatedId: newsId,
    });
  }

  async sendTenderNotification(tenderId: string, title: string, closingDate: string): Promise<any> {
    return this.sendPushNotification({
      title: 'New Tender Available',
      body: `${title} - Closes: ${closingDate}`,
      data: { type: 'tender', tenderId, screen: 'Tenders' },
      type: 'tender',
      relatedId: tenderId,
    });
  }

  async sendVacancyNotification(vacancyId: string, title: string, closingDate: string): Promise<any> {
    return this.sendPushNotification({
      title: 'New Job Vacancy',
      body: `${title} - Closes: ${closingDate}`,
      data: { type: 'vacancy', vacancyId, screen: 'Vacancies' },
      type: 'vacancy',
      relatedId: vacancyId,
    });
  }

  async getNotificationLogs(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const repo = AppDataSource.getRepository(NotificationLog);
      const [logs, total] = await Promise.all([
        repo.find({ order: { sentAt: 'DESC' }, skip, take: limit }),
        repo.count(),
      ]);
      return { logs, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
      logger.error('Get notification logs error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve notification logs',
        details: error.message,
      };
    }
  }

  async getActivePushTokensCount(): Promise<number> {
    try {
      const repo = AppDataSource.getRepository(PushToken);
      return await repo.count({ where: { active: true } });
    } catch (error: any) {
      logger.error('Get active push tokens count error:', error);
      return 0;
    }
  }

  async deactivatePushToken(pushToken: string): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PushToken);
      const token = await repo.findOne({ where: { pushToken } });
      if (token) {
        token.active = false;
        await repo.save(token);
        logger.info(`Push token deactivated: ${pushToken.substring(0, 20)}...`);
      }
    } catch (error: any) {
      logger.error('Deactivate push token error:', error);
    }
  }
}

export const notificationsService = new NotificationsService();
