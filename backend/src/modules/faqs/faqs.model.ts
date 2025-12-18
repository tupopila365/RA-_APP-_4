import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IFAQ extends MongooseDocument {
  question: string;
  answer: string;
  category?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
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
    category: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
faqSchema.index({ question: 'text', answer: 'text' });
faqSchema.index({ category: 1 });
faqSchema.index({ order: 1 });
faqSchema.index({ createdAt: -1 });

export const FAQModel = mongoose.model<IFAQ>('FAQ', faqSchema);

