import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IFAQ extends MongooseDocument {
    question: string;
    answer: string;
    category?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FAQModel: mongoose.Model<IFAQ, {}, {}, {}, mongoose.Document<unknown, {}, IFAQ, {}, {}> & IFAQ & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=faqs.model.d.ts.map