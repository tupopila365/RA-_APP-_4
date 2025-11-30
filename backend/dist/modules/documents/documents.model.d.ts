import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IDocument extends MongooseDocument {
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: 'policy' | 'tender' | 'report' | 'other';
    indexed: boolean;
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DocumentModel: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument, {}, {}> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=documents.model.d.ts.map