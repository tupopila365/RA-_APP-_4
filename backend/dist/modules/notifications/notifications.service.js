"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const db_1 = require("../../config/db");
const notifications_entity_1 = require("./notifications.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class NotificationsService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo();
    }
    async registerPushToken(pushToken, platform, deviceInfo, userId) {
        try {
            if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid Expo push token',
                };
            }
            const repo = db_1.AppDataSource.getRepository(notifications_entity_1.PushToken);
            let token = await repo.findOne({ where: { pushToken } });
            if (token) {
                token.platform = platform;
                token.deviceInfo = deviceInfo;
                token.active = true;
                token.lastUsed = new Date();
                if (userId)
                    token.userId = parseInt(userId, 10);
                await repo.save(token);
            }
            else {
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
            logger_1.logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);
            return token;
        }
        catch (error) {
            logger_1.logger.error('Register push token error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to register push token',
                details: error.message,
            };
        }
    }
    async sendPushNotification(dto, pushTokens) {
        try {
            let tokens;
            if (pushTokens && pushTokens.length > 0) {
                tokens = pushTokens;
            }
            else {
                const repo = db_1.AppDataSource.getRepository(notifications_entity_1.PushToken);
                const tokenDocs = await repo.find({ where: { active: true } });
                tokens = tokenDocs.map((doc) => doc.pushToken);
            }
            if (tokens.length === 0) {
                logger_1.logger.warn('No push tokens available to send notification');
                return { sentCount: 0, failedCount: 0, message: 'No recipients available' };
            }
            const messages = [];
            for (const pushToken of tokens) {
                if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
                    logger_1.logger.warn(`Invalid push token: ${pushToken}`);
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
            const tickets = [];
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                }
                catch (error) {
                    logger_1.logger.error('Error sending push notification chunk:', error);
                }
            }
            let sentCount = 0;
            let failedCount = 0;
            for (const ticket of tickets) {
                if (ticket.status === 'ok')
                    sentCount++;
                else {
                    failedCount++;
                    logger_1.logger.error('Push notification error:', ticket);
                }
            }
            const logRepo = db_1.AppDataSource.getRepository(notifications_entity_1.NotificationLog);
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
            logger_1.logger.info(`Sent ${sentCount} notifications, ${failedCount} failed`);
            return { sentCount, failedCount, totalRecipients: tokens.length };
        }
        catch (error) {
            logger_1.logger.error('Send push notification error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.SERVER_ERROR,
                message: 'Failed to send push notification',
                details: error.message,
            };
        }
    }
    async sendNewsNotification(newsId, title, excerpt) {
        return this.sendPushNotification({
            title: 'New News Article',
            body: title,
            data: { type: 'news', newsId, screen: 'NewsDetail' },
            type: 'news',
            relatedId: newsId,
        });
    }
    async sendTenderNotification(tenderId, title, closingDate) {
        return this.sendPushNotification({
            title: 'New Tender Available',
            body: `${title} - Closes: ${closingDate}`,
            data: { type: 'tender', tenderId, screen: 'Tenders' },
            type: 'tender',
            relatedId: tenderId,
        });
    }
    async sendVacancyNotification(vacancyId, title, closingDate) {
        return this.sendPushNotification({
            title: 'New Job Vacancy',
            body: `${title} - Closes: ${closingDate}`,
            data: { type: 'vacancy', vacancyId, screen: 'Vacancies' },
            type: 'vacancy',
            relatedId: vacancyId,
        });
    }
    async getNotificationLogs(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const repo = db_1.AppDataSource.getRepository(notifications_entity_1.NotificationLog);
            const [logs, total] = await Promise.all([
                repo.find({ order: { sentAt: 'DESC' }, skip, take: limit }),
                repo.count(),
            ]);
            return { logs, total, page, totalPages: Math.ceil(total / limit) };
        }
        catch (error) {
            logger_1.logger.error('Get notification logs error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve notification logs',
                details: error.message,
            };
        }
    }
    async getActivePushTokensCount() {
        try {
            const repo = db_1.AppDataSource.getRepository(notifications_entity_1.PushToken);
            return await repo.count({ where: { active: true } });
        }
        catch (error) {
            logger_1.logger.error('Get active push tokens count error:', error);
            return 0;
        }
    }
    async deactivatePushToken(pushToken) {
        try {
            const repo = db_1.AppDataSource.getRepository(notifications_entity_1.PushToken);
            const token = await repo.findOne({ where: { pushToken } });
            if (token) {
                token.active = false;
                await repo.save(token);
                logger_1.logger.info(`Push token deactivated: ${pushToken.substring(0, 20)}...`);
            }
        }
        catch (error) {
            logger_1.logger.error('Deactivate push token error:', error);
        }
    }
}
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notifications.service.js.map