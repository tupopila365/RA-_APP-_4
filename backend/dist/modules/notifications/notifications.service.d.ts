import { PushToken } from './notifications.entity';
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
    registerPushToken(pushToken: string, platform: 'ios' | 'android', deviceInfo: any, userId?: string): Promise<PushToken>;
    sendPushNotification(dto: SendNotificationDTO, pushTokens?: string[]): Promise<any>;
    sendNewsNotification(newsId: string, title: string, excerpt: string): Promise<any>;
    sendTenderNotification(tenderId: string, title: string, closingDate: string): Promise<any>;
    sendVacancyNotification(vacancyId: string, title: string, closingDate: string): Promise<any>;
    getNotificationLogs(page?: number, limit?: number): Promise<any>;
    getActivePushTokensCount(): Promise<number>;
    deactivatePushToken(pushToken: string): Promise<void>;
}
export declare const notificationsService: NotificationsService;
export {};
//# sourceMappingURL=notifications.service.d.ts.map