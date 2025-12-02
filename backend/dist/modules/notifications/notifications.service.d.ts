import { IPushToken } from './notifications.model';
export interface SendNotificationDTO {
    title: string;
    body: string;
    data?: any;
    type: 'news' | 'tender' | 'vacancy' | 'general';
    relatedId?: string;
    sentBy?: string;
}
declare class NotificationsService {
    private expo;
    constructor();
    /**
     * Register a push token
     */
    registerPushToken(pushToken: string, platform: 'ios' | 'android', deviceInfo: any, userId?: string): Promise<IPushToken>;
    /**
     * Send push notification to specific tokens
     */
    sendPushNotification(dto: SendNotificationDTO, pushTokens?: string[]): Promise<any>;
    /**
     * Send notification for new news article
     */
    sendNewsNotification(newsId: string, title: string, excerpt: string): Promise<any>;
    /**
     * Send notification for new tender
     */
    sendTenderNotification(tenderId: string, title: string, closingDate: string): Promise<any>;
    /**
     * Send notification for new vacancy
     */
    sendVacancyNotification(vacancyId: string, title: string, closingDate: string): Promise<any>;
    /**
     * Get notification logs
     */
    getNotificationLogs(page?: number, limit?: number): Promise<any>;
    /**
     * Get active push tokens count
     */
    getActivePushTokensCount(): Promise<number>;
    /**
     * Deactivate a push token
     */
    deactivatePushToken(pushToken: string): Promise<void>;
}
export declare const notificationsService: NotificationsService;
export {};
//# sourceMappingURL=notifications.service.d.ts.map