import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IExecutiveSummary {
    title: string;
    url: string;
    fileName: string;
}
export interface IProcurementAward extends MongooseDocument {
    type: 'opportunities' | 'rfq';
    procurementReference: string;
    description: string;
    executiveSummary: IExecutiveSummary;
    successfulBidder: string;
    dateAwarded: Date;
    published: boolean;
    publishedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProcurementAwardModel: mongoose.Model<IProcurementAward, {}, {}, {}, mongoose.Document<unknown, {}, IProcurementAward, {}, {}> & IProcurementAward & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=procurement-awards.model.d.ts.map