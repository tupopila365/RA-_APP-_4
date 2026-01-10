import mongoose, { Document as MongooseDocument } from 'mongoose';
export type RoadworkStatus = 'Planned' | 'Ongoing' | 'Completed';
export interface IRoadwork extends MongooseDocument {
    title: string;
    road: string;
    section: string;
    area?: string;
    status: RoadworkStatus;
    startDate?: Date;
    endDate?: Date;
    expectedDelayMinutes?: number;
    trafficControl?: string;
    expectedCompletion?: Date;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RoadworkModel: mongoose.Model<IRoadwork, {}, {}, {}, mongoose.Document<unknown, {}, IRoadwork, {}, {}> & IRoadwork & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=roadworks.model.d.ts.map