"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPushQueueStats = exports.initPushWorker = exports.enqueuePushJob = exports.getPushQueue = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const hasRedisConfig = !!env_1.env.REDIS_HOST && !!env_1.env.REDIS_PORT;
const sanitizedPrefix = (env_1.env.PUSH_QUEUE_PREFIX || 'push').replace(/:/g, '-');
const queueName = `${sanitizedPrefix}-notifications`;
let pushQueue = null;
let pushWorker = null;
let pushEvents = null;
const buildConnection = () => ({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: env_1.env.REDIS_PASSWORD,
});
const getPushQueue = () => {
    if (!hasRedisConfig) {
        logger_1.logger.warn('Push queue disabled: Redis not configured');
        return null;
    }
    if (!pushQueue) {
        pushQueue = new bullmq_1.Queue(queueName, {
            connection: buildConnection(),
            defaultJobOptions: {
                attempts: env_1.env.PUSH_JOB_ATTEMPTS || 3,
                backoff: {
                    type: 'exponential',
                    delay: env_1.env.PUSH_JOB_BACKOFF_MS || 2000,
                },
                removeOnComplete: 500,
                removeOnFail: 500,
            },
        });
        pushEvents = new bullmq_1.QueueEvents(queueName, { connection: buildConnection() });
        pushEvents.on('failed', ({ jobId, failedReason }) => {
            logger_1.logger.error(`Push job ${jobId} failed: ${failedReason}`);
        });
        pushEvents.on('completed', ({ jobId }) => {
            logger_1.logger.info(`Push job ${jobId} completed`);
        });
        logger_1.logger.info(`Push queue initialized with name: ${queueName}`);
    }
    return pushQueue;
};
exports.getPushQueue = getPushQueue;
const enqueuePushJob = async (data, options) => {
    const queue = (0, exports.getPushQueue)();
    if (!queue) {
        return null;
    }
    const delay = data.scheduledAt && new Date(data.scheduledAt).getTime() > Date.now()
        ? new Date(data.scheduledAt).getTime() - Date.now()
        : 0;
    const job = await queue.add('push', data, {
        jobId: data.idempotencyKey,
        delay,
        ...options,
    });
    return { jobId: job.id, scheduledAt: data.scheduledAt };
};
exports.enqueuePushJob = enqueuePushJob;
const initPushWorker = (processor) => {
    if (!hasRedisConfig) {
        logger_1.logger.warn('Push worker disabled: Redis not configured');
        return;
    }
    if (pushWorker) {
        return;
    }
    pushWorker = new bullmq_1.Worker(queueName, async (job) => {
        return processor(job);
    }, {
        connection: buildConnection(),
        concurrency: 5,
    });
    pushWorker.on('failed', (job, err) => {
        logger_1.logger.error(`Push worker failed job ${job?.id}: ${err.message}`, { err });
    });
    pushWorker.on('completed', (job) => {
        logger_1.logger.debug(`Push worker completed job ${job?.id}`);
    });
    logger_1.logger.info('Push worker initialized');
};
exports.initPushWorker = initPushWorker;
const getPushQueueStats = async () => {
    const queue = (0, exports.getPushQueue)();
    if (!queue) {
        return {};
    }
    return queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
};
exports.getPushQueueStats = getPushQueueStats;
//# sourceMappingURL=push-queue.service.js.map