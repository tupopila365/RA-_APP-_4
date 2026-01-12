import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

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

const chatbotInteractionSchema = new Schema<IChatbotInteraction>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    feedback: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
chatbotInteractionSchema.index({ timestamp: -1 });
chatbotInteractionSchema.index({ feedback: 1 });
chatbotInteractionSchema.index({ category: 1 });
chatbotInteractionSchema.index({ sessionId: 1 });
chatbotInteractionSchema.index({ createdAt: -1 });
chatbotInteractionSchema.index({ question: 'text', answer: 'text' });

export const ChatbotInteractionModel = mongoose.model<IChatbotInteraction>(
  'ChatbotInteraction',
  chatbotInteractionSchema
);


















