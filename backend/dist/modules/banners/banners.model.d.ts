import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IBanner extends MongooseDocument {
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl?: string;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BannerModel: mongoose.Model<IBanner, {}, {}, {}, mongoose.Document<unknown, {}, IBanner, {}, {}> & IBanner & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=banners.model.d.ts.map