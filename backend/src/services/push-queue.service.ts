import { Queue, QueueScheduler, Worker, JobsOptions, Job, QueueEvents } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';

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

const hasRedisConfig = !!env.REDIS_HOST && !!env.REDIS_PORT;
const sanitizedPrefix = (env.PUSH_QUEUE_PREFIX || 'push').replace(/:/g, '-');
const queueName = `${sanitizedPrefix}-notifications`;

let pushQueue: Queue<PushJobData> | null = null;
let pushScheduler: QueueScheduler | null = null;
let pushWorker: Worker<PushJobData> | null = null;
let pushEvents: QueueEvents | null = null;

const buildConnection = () => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
});

export const getPushQueue = (): Queue<PushJobData> | null => {
  if (!hasRedisConfig) {
    logger.warn('Push queue disabled: Redis not configured');
    return null;
  }

  if (!pushQueue) {
    pushQueue = new Queue<PushJobData>(queueName, {
      connection: buildConnection(),
      defaultJobOptions: {
        attempts: env.PUSH_JOB_ATTEMPTS || 3,
        backoff: {
          type: 'exponential',
          delay: env.PUSH_JOB_BACKOFF_MS || 2000,
        },
        removeOnComplete: 500,
        removeOnFail: 500,
      },
    });

    pushScheduler = new QueueScheduler(queueName, { connection: buildConnection() });
    pushEvents = new QueueEvents(queueName, { connection: buildConnection() });

    pushEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error(`Push job ${jobId} failed: ${failedReason}`);
    });

    pushEvents.on('completed', ({ jobId }) => {
      logger.info(`Push job ${jobId} completed`);
    });

    logger.info(`Push queue initialized with name: ${queueName}`);
  }

  return pushQueue;
};

export const enqueuePushJob = async (
  data: PushJobData,
  options?: JobsOptions
): Promise<{ jobId?: string; scheduledAt?: string } | null> => {
  const queue = getPushQueue();
  if (!queue) {
    return null;
  }

  const delay =
    data.scheduledAt && new Date(data.scheduledAt).getTime() > Date.now()
      ? new Date(data.scheduledAt).getTime() - Date.now()
      : 0;

  const job = await queue.add('push', data, {
    jobId: data.idempotencyKey,
    delay,
    ...options,
  });

  return { jobId: job.id, scheduledAt: data.scheduledAt };
};

export const initPushWorker = (
  processor: (job: Job<PushJobData>) => Promise<any>
): void => {
  if (!hasRedisConfig) {
    logger.warn('Push worker disabled: Redis not configured');
    return;
  }

  if (pushWorker) {
    return;
  }

  pushWorker = new Worker<PushJobData>(
    queueName,
    async (job) => {
      return processor(job);
    },
    {
      connection: buildConnection(),
      concurrency: 5,
    }
  );

  pushWorker.on('failed', (job, err) => {
    logger.error(`Push worker failed job ${job?.id}: ${err.message}`, { err });
  });

  pushWorker.on('completed', (job) => {
    logger.debug(`Push worker completed job ${job?.id}`);
  });

  logger.info('Push worker initialized');
};

export const getPushQueueStats = async (): Promise<Record<string, number>> => {
  const queue = getPushQueue();
  if (!queue) {
    return {};
  }
  return queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
};

