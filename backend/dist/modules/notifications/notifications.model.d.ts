export interface IPushToken {
    userId?: number;
    pushToken: string;
    platform: 'ios' | 'android';
    deviceInfo: {
        brand?: string;
        modelName?: string;
        osName?: string;
        osVersion?: string;
    };
    active: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface INotificationLog {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    recipients: string[];
    sentCount: number;
    failedCount: number;
    type: 'news' | 'tender' | 'vacancy' | 'general';
    relatedId?: string;
    sentById?: number;
    jobId?: string;
    status?: 'queued' | 'sent' | 'failed' | 'partial';
    platforms?: ('ios' | 'android')[];
    scheduledAt?: Date;
    sentAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=notifications.model.d.ts.map