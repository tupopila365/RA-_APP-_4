"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const notifications_model_1 = require("./notifications.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class NotificationsService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo();
    }
    /**
     * Register a push token
     */
    async registerPushToken(pushToken, platform, deviceInfo, userId) {
        try {
            // Validate the push token
            if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid Expo push token',
                };
            }
            // Check if token already exists
            let token = await notifications_model_1.PushTokenModel.findOne({ pushToken });
            if (token) {
                // Update existing token
                token.platform = platform;
                token.deviceInfo = deviceInfo;
                token.active = true;
                token.lastUsed = new Date();
                if (userId) {
                    token.userId = userId;
                }
                await token.save();
            }
            else {
                // Create new token
                token = await notifications_model_1.PushTokenModel.create({
                    pushToken,
                    platform,
                    deviceInfo,
                    userId,
                    active: true,
                    lastUsed: new Date(),
                });
            }
            logger_1.logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);
            return token;
        }
        catch (error) {
            logger_1.logger.error('Register push token error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to register push token',
                details: error.message,
            };
        }
    }
    /**
     * Send push notification to specific tokens
     */
    async sendPushNotification(dto, pushTokens) {
        try {
            let tokens;
            if (pushTokens && pushTokens.length > 0) {
                tokens = pushTokens;
            }
            else {
                // Get all active push tokens
                const tokenDocs = await notifications_model_1.PushTokenModel.find({ active: true });
                tokens = tokenDocs.map((doc) => doc.pushToken);
            }
            if (tokens.length === 0) {
                logger_1.logger.warn('No push tokens available to send notification');
                return {
                    sentCount: 0,
                    failedCount: 0,
                    message: 'No recipients available',
                };
            }
            // Create messages
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
            // Send notifications in chunks
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
            // Count successes and failures
            let sentCount = 0;
            let failedCount = 0;
            for (const ticket of tickets) {
                if (ticket.status === 'ok') {
                    sentCount++;
                }
                else {
                    failedCount++;
                    logger_1.logger.error('Push notification error:', ticket);
                }
            }
            // Log notification
            await notifications_model_1.NotificationLogModel.create({
                title: dto.title,
                body: dto.body,
                data: dto.data,
                recipients: tokens,
                sentCount,
                failedCount,
                type: dto.type,
                relatedId: dto.relatedId,
                sentBy: dto.sentBy,
                sentAt: new Date(),
            });
            logger_1.logger.info(`Sent ${sentCount} notifications, ${failedCount} failed`);
            return {
                sentCount,
                failedCount,
                totalRecipients: tokens.length,
            };
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
    /**
     * Send notification for new news article
     */
    async sendNewsNotification(newsId, title, excerpt) {
        return this.sendPushNotification({
            title: 'New News Article',
            body: title,
            data: {
                type: 'news',
                newsId,
                screen: 'NewsDetail',
            },
            type: 'news',
            relatedId: newsId,
        });
    }
    /**
     * Send notification for new tender
     */
    async sendTenderNotification(tenderId, title, closingDate) {
        return this.sendPushNotification({
            title: 'New Tender Available',
            body: `${title} - Closes: ${closingDate}`,
            data: {
                type: 'tender',
                tenderId,
                screen: 'Tenders',
            },
            type: 'tender',
            relatedId: tenderId,
        });
    }
    /**
     * Send notification for new vacancy
     */
    async sendVacancyNotification(vacancyId, title, closingDate) {
        return this.sendPushNotification({
            title: 'New Job Vacancy',
            body: `${title} - Closes: ${closingDate}`,
            data: {
                type: 'vacancy',
                vacancyId,
                screen: 'Vacancies',
            },
            type: 'vacancy',
            relatedId: vacancyId,
        });
    }
    /**
     * Get notification logs
     */
    async getNotificationLogs(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [logs, total] = await Promise.all([
                notifications_model_1.NotificationLogModel.find()
                    .sort({ sentAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('sentBy', 'email')
                    .lean(),
                notifications_model_1.NotificationLogModel.countDocuments(),
            ]);
            return {
                logs,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
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
    /**
     * Get active push tokens count
     */
    async getActivePushTokensCount() {
        try {
            return await notifications_model_1.PushTokenModel.countDocuments({ active: true });
        }
        catch (error) {
            logger_1.logger.error('Get active push tokens count error:', error);
            return 0;
        }
    }
    /**
     * Deactivate a push token
     */
    async deactivatePushToken(pushToken) {
        try {
            await notifications_model_1.PushTokenModel.updateOne({ pushToken }, { active: false });
            logger_1.logger.info(`Push token deactivated: ${pushToken.substring(0, 20)}...`);
        }
        catch (error) {
            logger_1.logger.error('Deactivate push token error:', error);
        }
    }
}
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notifications.service.js.map