import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface ITender extends MongooseDocument {
    referenceNumber: string;
    title: string;
    description: string;
    category: string;
    value?: number;
    status: 'open' | 'closed' | 'upcoming';
    openingDate: Date;
    closingDate: Date;
    pdfUrl: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TenderModel: mongoose.Model<ITender, {}, {}, {}, mongoose.Document<unknown, {}, ITender, {}, {}> & ITender & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=tenders.model.d.ts.map