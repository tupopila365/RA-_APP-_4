"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = exports.NotificationsController = void 0;
const notifications_service_1 = require("./notifications.service");
const notifications_model_1 = require("./notifications.model");
const logger_1 = require("../../utils/logger");
class NotificationsController {
    /**
     * Register push token (public endpoint - no auth required)
     * POST /api/notifications/register
     */
    async registerToken(req, res, next) {
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
            const token = await notifications_service_1.notificationsService.registerPushToken(pushToken, platform, deviceInfo || {});
            logger_1.logger.info(`Push token registered: ${pushToken.substring(0, 20)}...`);
            res.status(200).json({
                success: true,
                data: { tokenId: token._id },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Register token error:', error);
            next(error);
        }
    }
    /**
     * Send manual notification (requires auth)
     * POST /api/notifications/send
     */
    async sendNotification(req, res, next) {
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
            const result = await notifications_service_1.notificationsService.sendPushNotification({
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
        }
        catch (error) {
            logger_1.logger.error('Send notification error:', error);
            next(error);
        }
    }
    /**
     * Get notification logs (requires auth)
     * GET /api/notifications/logs
     */
    async getNotificationLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await notifications_service_1.notificationsService.getNotificationLogs(page, limit);
            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get notification logs error:', error);
            next(error);
        }
    }
    /**
     * Get notification stats (requires auth)
     * GET /api/notifications/stats
     */
    async getStats(req, res, next) {
        try {
            const activeTokens = await notifications_service_1.notificationsService.getActivePushTokensCount();
            res.status(200).json({
                success: true,
                data: { activeDevices: activeTokens },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get stats error:', error);
            next(error);
        }
    }
    /**
     * Get all registered tokens (for debugging - requires auth)
     * GET /api/notifications/tokens
     */
    async getTokens(req, res, next) {
        try {
            const tokens = await notifications_model_1.PushTokenModel.find({ active: true })
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
        }
        catch (error) {
            logger_1.logger.error('Get tokens error:', error);
            next(error);
        }
    }
}
exports.NotificationsController = NotificationsController;
exports.notificationsController = new NotificationsController();
//# sourceMappingURL=notifications.controller.js.map