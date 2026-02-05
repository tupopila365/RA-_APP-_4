export declare class PushToken {
    id: number;
    userId: number | null;
    pushToken: string;
    platform: 'ios' | 'android';
    deviceInfo: {
        brand?: string;
        modelName?: string;
        osName?: string;
        osVersion?: string;
    } | null;
    active: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class NotificationLog {
    id: number;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    recipients: string[];
    sentCount: number;
    failedCount: number;
    type: 'news' | 'tender' | 'vacancy' | 'general';
    relatedId: string | null;
    sentById: number | null;
    jobId: string | null;
    status: 'queued' | 'sent' | 'failed' | 'partial' | null;
    platforms: ('ios' | 'android')[] | null;
    scheduledAt: Date | null;
    sentAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=notifications.entity.d.ts.map