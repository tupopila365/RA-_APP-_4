import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IProcurementPlan extends MongooseDocument {
    fiscalYear: string;
    documentUrl: string;
    documentFileName: string;
    published: boolean;
    publishedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProcurementPlanModel: mongoose.Model<IProcurementPlan, {}, {}, {}, mongoose.Document<unknown, {}, IProcurementPlan, {}, {}> & IProcurementPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=procurement-plan.model.d.ts.map