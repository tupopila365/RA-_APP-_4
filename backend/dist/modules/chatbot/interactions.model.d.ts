import mongoose, { Document as MongooseDocument } from 'mongoose';
export type FeedbackType = 'like' | 'dislike' | null;
export interface IChatbotInteraction extends MongooseDocument {
    question: string;
    answer: string;
    feedback?: FeedbackType;
    comment?: string;
    timestamp: Date;
    sessionId: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatbotInteractionModel: mongoose.Model<IChatbotInteraction, {}, {}, {}, mongoose.Document<unknown, {}, IChatbotInteraction, {}, {}> & IChatbotInteraction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=interactions.model.d.ts.map