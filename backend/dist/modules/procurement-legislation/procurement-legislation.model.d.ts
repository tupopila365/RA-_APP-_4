import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IProcurementLegislation extends MongooseDocument {
    section: 'act' | 'regulations' | 'guidelines';
    title: string;
    documentUrl: string;
    documentFileName: string;
    published: boolean;
    publishedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProcurementLegislationModel: mongoose.Model<IProcurementLegislation, {}, {}, {}, mongoose.Document<unknown, {}, IProcurementLegislation, {}, {}> & IProcurementLegislation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=procurement-legislation.model.d.ts.map