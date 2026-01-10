import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IProcurementOpeningRegister extends MongooseDocument {
    type: 'opportunities' | 'rfq';
    reference: string;
    description: string;
    bidOpeningDate: Date;
    status: 'open' | 'closed';
    noticeUrl: string;
    noticeFileName: string;
    category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
    published: boolean;
    publishedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProcurementOpeningRegisterModel: mongoose.Model<IProcurementOpeningRegister, {}, {}, {}, mongoose.Document<unknown, {}, IProcurementOpeningRegister, {}, {}> & IProcurementOpeningRegister & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=procurement-opening-register.model.d.ts.map