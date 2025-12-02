import mongoose, { Document } from 'mongoose';
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
export declare const PushTokenModel: mongoose.Model<IPushToken, {}, {}, {}, mongoose.Document<unknown, {}, IPushToken, {}, {}> & IPushToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface INotificationLog extends Document {
    title: string;
    body: string;
    data?: any;
    recipients: string[];
    sentCount: number;
    failedCount: number;
    type: 'news' | 'tender' | 'vacancy' | 'general';
    relatedId?: string;
    sentBy?: mongoose.Types.ObjectId;
    sentAt: Date;
    createdAt: Date;
}
export declare const NotificationLogModel: mongoose.Model<INotificationLog, {}, {}, {}, mongoose.Document<unknown, {}, INotificationLog, {}, {}> & INotificationLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=notifications.model.d.ts.map