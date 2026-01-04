import mongoose, { Document, Schema } from 'mongoose';

export interface IPushToken extends Document {
  userId?: mongoose.Types.ObjectId;
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

const PushTokenSchema = new Schema<IPushToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    pushToken: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    deviceInfo: {
      brand: String,
      modelName: String,
      osName: String,
      osVersion: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PushTokenSchema.index({ userId: 1 });
PushTokenSchema.index({ active: 1 });

export const PushTokenModel = mongoose.model<IPushToken>('PushToken', PushTokenSchema);

export interface INotificationLog extends Document {
  title: string;
  body: string;
  data?: any;
  recipients: string[]; // Array of push tokens
  sentCount: number;
  failedCount: number;
  type: 'news' | 'tender' | 'vacancy' | 'general';
  relatedId?: string;
  sentBy?: mongoose.Types.ObjectId;
  jobId?: string;
  status?: 'queued' | 'sent' | 'failed' | 'partial';
  platforms?: ('ios' | 'android')[];
  scheduledAt?: Date;
  sentAt: Date;
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    recipients: [{
      type: String,
    }],
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['news', 'tender', 'vacancy', 'general'],
      required: true,
    },
    relatedId: {
      type: String,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    jobId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed', 'partial'],
      default: 'queued',
    },
    platforms: [{
      type: String,
      enum: ['ios', 'android'],
    }],
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationLogSchema.index({ type: 1, sentAt: -1 });
NotificationLogSchema.index({ relatedId: 1 });

export const NotificationLogModel = mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
