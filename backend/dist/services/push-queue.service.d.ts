import { Queue, JobsOptions, Job } from 'bullmq';
export type PushPlatform = 'ios' | 'android';
export interface PushJobData {
    title: string;
    body: string;
    data?: any;
    type: 'news' | 'tender' | 'vacancy' | 'general';
    relatedId?: string;
    sentBy?: string;
    pushTokens?: string[];
    platforms?: PushPlatform[];
    idempotencyKey?: string;
    scheduledAt?: string;
}
export declare const getPushQueue: () => Queue<PushJobData> | null;
export declare const enqueuePushJob: (data: PushJobData, options?: JobsOptions) => Promise<{
    jobId?: string;
    scheduledAt?: string;
} | null>;
export declare const initPushWorker: (processor: (job: Job<PushJobData>) => Promise<any>) => void;
export declare const getPushQueueStats: () => Promise<Record<string, number>>;
//# sourceMappingURL=push-queue.service.d.ts.map