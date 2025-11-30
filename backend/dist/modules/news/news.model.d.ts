import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface INews extends MongooseDocument {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    author: string;
    imageUrl?: string;
    published: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NewsModel: mongoose.Model<INews, {}, {}, {}, mongoose.Document<unknown, {}, INews, {}, {}> & INews & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=news.model.d.ts.map