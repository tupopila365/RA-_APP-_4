import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceiptId, ExpoPushReceipt } from 'expo-server-sdk';
import { Job } from 'bullmq';
import { PushTokenModel, NotificationLogModel, IPushToken } from './notifications.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { env } from '../../config/env';
import { enqueuePushJob, getPushQueueStats, initPushWorker, PushJobData, PushPlatform } from '../../services/push-queue.service';

export interface SendNotificationDTO {
  title: string;
  body: string;
  data?: any;
  type: 'news' | 'tender' | 'vacancy' | 'general';
  relatedId?: string;
  sentBy?: string;
  platforms?: PushPlatform[];
  idempotencyKey?: string;
  scheduledAt?: string;
}

export interface SendNotificationOptions {
  useQueue?: boolean;
  scheduledAt?: string;
  pushTokens?: string[];
  platforms?: PushPlatform[];
  idempotencyKey?: string;
}

class NotificationsService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo(
      env.PUSH_EXPO_ACCESS_TOKEN
        ? { accessToken: env.PUSH_EXPO_ACCESS_TOKEN }
        : undefined
    );

    // Initialize background worker once per process
    initPushWorker(this.processPushJob.bind(this));
  }

  /**
   * Worker processor for queued jobs
   */
  private async processPushJob(job: Job<PushJobData>): Promise<any> {
    return this.deliverPushNotification(
      {
        title: job.data.title,
        body: job.data.body,
        data: job.data.data,
        type: job.data.type,
        relatedId: job.data.relatedId,
        sentBy: job.data.sentBy,
        platforms: job.data.platforms,
        idempotencyKey: job.data.idempotencyKey || job.id,
      },
      job.data.pushTokens
    );
  }

  /**
   * Register a push token
   */
  async registerPushToken(
    pushToken: string,
    platform: 'ios' | 'android',
    deviceInfo: any,
    userId?: string
  ): Promise<IPushToken> {
    try {
      // Validate the push token
      if (!Expo.isExpoPushToken(pushToken)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid Expo push token',
        };
      }

      // Check if token already exists
      let token = await PushTokenModel.findOne({ pushToken });

      if (token) {
        // Update existing token
        token.platform = platform;
        token.deviceInfo = deviceInfo;
        token.active = true;
        token.lastUsed = new Date();
        if (userId) {
          token.userId = userId as any;
        }
        await token.save();
      } else {
        // Create new token
        token = await PushTokenModel.create({
          pushToken,
          platform,
          deviceInfo,
          userId,
          active: true,
          lastUsed: new Date(),
        });
      }

      logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);
      return token;
    } catch (error: any) {
      logger.error('Register push token error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to register push token',
        details: error.message,
      };
    }
  }

  /**
   * Send push notification: enqueue when possible, otherwise send immediately
   */
  async sendPushNotification(dto: SendNotificationDTO, options?: SendNotificationOptions): Promise<any> {
    const idempotencyKey =
      options?.idempotencyKey || dto.idempotencyKey || this.buildIdempotencyKey(dto);

    const shouldQueue = options?.useQueue !== false && (!!options?.scheduledAt || !!enqueuePushJob);

    const jobData: PushJobData = {
      title: dto.title,
      body: dto.body,
      data: dto.data,
      type: dto.type,
      relatedId: dto.relatedId,
      sentBy: dto.sentBy,
      platforms: options?.platforms || dto.platforms,
      pushTokens: options?.pushTokens,
      idempotencyKey,
      scheduledAt: options?.scheduledAt || dto.scheduledAt,
    };

    if (shouldQueue) {
      const enqueued = await enqueuePushJob(jobData);
      if (enqueued) {
        logger.info('Notification enqueued', { jobId: enqueued.jobId, scheduledAt: enqueued.scheduledAt });

        await NotificationLogModel.create({
          title: dto.title,
          body: dto.body,
          data: dto.data,
          recipients: [],
          sentCount: 0,
          failedCount: 0,
          type: dto.type,
          relatedId: dto.relatedId,
          sentBy: dto.sentBy,
          sentAt: new Date(),
          jobId: enqueued.jobId,
          status: 'queued',
          platforms: options?.platforms || dto.platforms,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        });

        return {
          mode: 'queued',
          jobId: enqueued.jobId,
          scheduledAt: enqueued.scheduledAt,
        };
      }

      if (options?.scheduledAt) {
        logger.warn('Scheduled notification requested but queue unavailable - sending immediately');
      }
    }

    return this.deliverPushNotification(
      { ...dto, platforms: options?.platforms || dto.platforms, idempotencyKey },
      options?.pushTokens
    );
  }

  /**
   * Direct delivery path with retries and receipt checking
   */
  private async deliverPushNotification(
    dto: SendNotificationDTO,
    pushTokens?: string[]
  ): Promise<any> {
    try {
      let tokens: string[];

      if (pushTokens && pushTokens.length > 0) {
        tokens = pushTokens;
      } else {
        // Get all active push tokens (optionally filtered by platform)
        const query: any = { active: true };
        if (dto.platforms && dto.platforms.length > 0) {
          query.platform = { $in: dto.platforms };
        }
        const tokenDocs = await PushTokenModel.find(query);
        tokens = tokenDocs.map((doc) => doc.pushToken);
      }

      if (tokens.length === 0) {
        logger.warn('No push tokens available to send notification');
        return {
          sentCount: 0,
          failedCount: 0,
          message: 'No recipients available',
        };
      }

      // Fetch all token documents at once for efficient platform detection
      const tokenDocs = await PushTokenModel.find({ pushToken: { $in: tokens } }).lean();
      const tokenToPlatformMap = new Map<string, 'ios' | 'android'>();
      tokenDocs.forEach((doc) => {
        tokenToPlatformMap.set(doc.pushToken, doc.platform);
      });

      // Create messages with platform-specific configurations
      const messages: ExpoPushMessage[] = [];
      const messageIndexToTokenMap = new Map<number, string>(); // Track which message index maps to which token

      for (let i = 0; i < tokens.length; i++) {
        const pushToken = tokens[i];
        if (!Expo.isExpoPushToken(pushToken)) {
          logger.warn(`Invalid push token: ${pushToken}`);
          continue;
        }

        // Get platform from cached map
        const platform = tokenToPlatformMap.get(pushToken) || 'android'; // Default to android if not found
        const isIOS = platform === 'ios';

        messages.push({
          to: pushToken,
          sound: 'default',
          title: dto.title,
          body: dto.body,
          data: {
            ...(dto.data || {}),
            type: dto.type,
            relatedId: dto.relatedId,
          },
          priority: 'high',
          // iOS-specific options
          ...(isIOS && {
            badge: 1, // Set badge count for iOS
          }),
          // Android-specific options
          ...(!isIOS && {
            channelId: 'default',
          }),
        });

        messageIndexToTokenMap.set(messages.length - 1, pushToken);
      }

      if (messages.length === 0) {
        logger.warn('No valid messages to send');
        return {
          sentCount: 0,
          failedCount: 0,
          message: 'No valid recipients available',
        };
      }

      // Send notifications in chunks (expo-server-sdk handles chunking automatically)
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      // Send with retry logic and exponential backoff
      for (const chunk of chunks) {
        let retries = 0;
        const maxRetries = env.PUSH_JOB_ATTEMPTS || 3;
        let success = false;

        while (retries < maxRetries && !success) {
          try {
            const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            success = true;
          } catch (error: any) {
            retries++;
            const isRetryable = this.isRetryableError(error);

            if (!isRetryable || retries >= maxRetries) {
              logger.error(`Error sending push notification chunk (attempt ${retries}/${maxRetries}):`, error);
              // Create error tickets for the entire chunk
              for (let i = 0; i < chunk.length; i++) {
                tickets.push({
                  status: 'error',
                  message: error.message || 'Failed to send notification',
                  details: error,
                });
              }
              break;
            }

            // Exponential backoff: wait 2^retries seconds
            const delay = Math.pow(2, retries) * 1000;
            logger.warn(`Retrying push notification chunk after ${delay}ms (attempt ${retries}/${maxRetries})`);
            await this.sleep(delay);
          }
        }
      }

      // Store ticket IDs for receipt checking
      // Note: tickets are returned in the same order as messages (which match tokens order)
      const receiptIds: ExpoPushReceiptId[] = [];
      const receiptIdToTokenMap = new Map<string, string>(); // Map receipt ID to push token

      // Process tickets and handle immediate errors
      let sentCount = 0;
      let failedCount = 0;
      const deviceNotRegisteredTokens: string[] = [];

      for (let i = 0; i < tickets.length && i < messages.length; i++) {
        const ticket = tickets[i];
        const token = messageIndexToTokenMap.get(i); // Get token from message index

        if (!token) {
          logger.warn(`No token found for message index ${i}`);
          continue;
        }

        if (ticket.status === 'ok' && ticket.id) {
          sentCount++;
          receiptIds.push(ticket.id);
          receiptIdToTokenMap.set(ticket.id, token);
        } else {
          failedCount++;
          logger.error('Push notification ticket error:', ticket);

          // Handle DeviceNotRegistered error immediately
          if (ticket.details?.error === 'DeviceNotRegistered') {
            deviceNotRegisteredTokens.push(token);
          }
        }
      }

      // Deactivate tokens that are not registered
      for (const token of deviceNotRegisteredTokens) {
        await this.deactivatePushToken(token);
        logger.info(`Deactivated push token due to DeviceNotRegistered: ${token.substring(0, 20)}...`);
      }

      // Check push receipts after configured delay (schedule asynchronously)
      if (receiptIds.length > 0) {
        // Schedule receipt checking (fire and forget)
        this.checkPushReceipts(receiptIds, receiptIdToTokenMap, dto).catch((error) => {
          logger.error('Error checking push receipts:', error);
        });
      }

      // Get list of all tokens that were actually sent (from messages)
      const sentTokens = Array.from(messageIndexToTokenMap.values());

      const status =
        failedCount === 0
          ? 'sent'
          : sentCount === 0
            ? 'failed'
            : 'partial';

      // Log notification
      await NotificationLogModel.create({
        title: dto.title,
        body: dto.body,
        data: dto.data,
        recipients: sentTokens,
        sentCount,
        failedCount,
        type: dto.type,
        relatedId: dto.relatedId,
        sentBy: dto.sentBy,
        sentAt: new Date(),
        jobId: dto.idempotencyKey,
        status,
        platforms: dto.platforms,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      });

      logger.info(`Sent ${sentCount} notifications, ${failedCount} failed, ${deviceNotRegisteredTokens.length} tokens deactivated`);

      return {
        sentCount,
        failedCount,
        totalRecipients: sentTokens.length,
        deactivatedTokens: deviceNotRegisteredTokens.length,
        status,
      };
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

  /**
   * Check push receipts for delivery status (called 15 minutes after sending)
   */
  private async checkPushReceipts(
    receiptIds: ExpoPushReceiptId[],
    receiptIdToTokenMap: Map<string, string>,
    dto: SendNotificationDTO
  ): Promise<void> {
    // Wait before checking receipts (as per Expo recommendation)
    const receiptDelay = env.PUSH_RECEIPT_DELAY_MS || 15 * 60 * 1000;
    await this.sleep(receiptDelay);

    try {
      // Get receipts in chunks (max 1000 per request)
      const receiptChunks: ExpoPushReceiptId[][] = [];
      for (let i = 0; i < receiptIds.length; i += 1000) {
        receiptChunks.push(receiptIds.slice(i, i + 1000));
      }

      for (const receiptChunk of receiptChunks) {
        const receiptIdChunk = receiptChunk.filter((id) => Expo.isExpoPushReceiptId(id)) as ExpoPushReceiptId[];
        
        if (receiptIdChunk.length === 0) continue;

        try {
          const receipts = await this.expo.getPushNotificationReceiptsAsync(receiptIdChunk);

          // Process receipts and handle errors
          for (const [receiptId, receipt] of Object.entries(receipts)) {
            const token = receiptIdToTokenMap.get(receiptId);

            if (receipt.status === 'error') {
              logger.error(`Push receipt error for token ${token?.substring(0, 20)}...:`, receipt);

              // Handle specific errors
              if (receipt.details?.error === 'DeviceNotRegistered' && token) {
                await this.deactivatePushToken(token);
                logger.info(`Deactivated push token due to DeviceNotRegistered in receipt: ${token.substring(0, 20)}...`);
              } else if (receipt.details?.error === 'MessageTooBig') {
                logger.error('Notification payload too large:', dto);
              } else if (receipt.details?.error === 'MessageRateExceeded') {
                logger.warn('Message rate exceeded for token:', token?.substring(0, 20));
              } else if (receipt.details?.error === 'InvalidCredentials') {
                logger.error('Invalid push notification credentials - check FCM/APN configuration');
              } else if (receipt.details?.error === 'MismatchSenderId') {
                logger.error('FCM Sender ID mismatch - check google-services.json and server key match');
              }
            } else if (receipt.status === 'ok') {
              logger.debug(`Push receipt OK for token ${token?.substring(0, 20)}...`);
            }
          }
        } catch (error: any) {
          logger.error('Error fetching push receipts:', error);
          // Don't throw - continue processing other chunks
        }
      }
    } catch (error: any) {
      logger.error('Error in checkPushReceipts:', error);
    }
  }

  /**
   * Check if an error is retryable (5xx errors, network errors, 429)
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;

    // HTTP status codes that are retryable
    const status = error.status || error.statusCode;
    if (status === 429 || (status >= 500 && status < 600)) {
      return true;
    }

    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility for exponential backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build a best-effort idempotency key to deduplicate enqueue requests
   */
  private buildIdempotencyKey(dto: SendNotificationDTO): string {
    const base = dto.relatedId ? `${dto.type}:${dto.relatedId}` : `${dto.type}:${dto.title}`;
    return `${base}:${Date.now()}`;
  }

  /**
   * Send notification for new news article
   */
  async sendNewsNotification(
    newsId: string,
    title: string,
    excerpt: string,
    options?: SendNotificationOptions
  ): Promise<any> {
    return this.sendPushNotification(
      {
        title: 'New News Article',
        body: title,
        data: {
          type: 'news',
          newsId,
          screen: 'NewsDetail',
        },
        type: 'news',
        relatedId: newsId,
      },
      options
    );
  }

  /**
   * Send notification for new tender
   */
  async sendTenderNotification(
    tenderId: string,
    title: string,
    closingDate: string,
    options?: SendNotificationOptions
  ): Promise<any> {
    return this.sendPushNotification(
      {
        title: 'New Tender Available',
        body: `${title} - Closes: ${closingDate}`,
        data: {
          type: 'tender',
          tenderId,
          screen: 'Tenders',
        },
        type: 'tender',
        relatedId: tenderId,
      },
      options
    );
  }

  /**
   * Send notification for new vacancy
   */
  async sendVacancyNotification(
    vacancyId: string,
    title: string,
    closingDate: string,
    options?: SendNotificationOptions
  ): Promise<any> {
    return this.sendPushNotification(
      {
        title: 'New Job Vacancy',
        body: `${title} - Closes: ${closingDate}`,
        data: {
          type: 'vacancy',
          vacancyId,
          screen: 'Vacancies',
        },
        type: 'vacancy',
        relatedId: vacancyId,
      },
      options
    );
  }

  /**
   * Get notification logs
   */
  async getNotificationLogs(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        NotificationLogModel.find()
          .sort({ sentAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('sentBy', 'email')
          .lean(),
        NotificationLogModel.countDocuments(),
      ]);

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
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

  /**
   * Get active push tokens count
   */
  async getActivePushTokensCount(): Promise<number> {
    try {
      return await PushTokenModel.countDocuments({ active: true });
    } catch (error: any) {
      logger.error('Get active push tokens count error:', error);
      return 0;
    }
  }

  /**
   * Get queue metrics for observability
   */
  async getQueueStats(): Promise<Record<string, number>> {
    try {
      return await getPushQueueStats();
    } catch (error) {
      logger.warn('Failed to fetch push queue stats', error as any);
      return {};
    }
  }

  /**
   * Deactivate a push token
   */
  async deactivatePushToken(pushToken: string): Promise<void> {
    try {
      await PushTokenModel.updateOne({ pushToken }, { active: false });
      logger.info(`Push token deactivated: ${pushToken.substring(0, 20)}...`);
    } catch (error: any) {
      logger.error('Deactivate push token error:', error);
    }
  }
}

export const notificationsService = new NotificationsService();
