import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

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

const tenderSchema = new Schema<ITender>(
  {
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Reference number cannot exceed 50 characters'],
    },
    title: {
      type: String,
      required: [true, 'Tender title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    value: {
      type: Number,
      min: [0, 'Value cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['open', 'closed', 'upcoming'],
        message: 'Status must be one of: open, closed, upcoming',
      },
    },
    openingDate: {
      type: Date,
      required: [true, 'Opening date is required'],
    },
    closingDate: {
      type: Date,
      required: [true, 'Closing date is required'],
      validate: {
        validator: function (this: ITender, v: Date) {
          return v > this.openingDate;
        },
        message: 'Closing date must be after opening date',
      },
    },
    pdfUrl: {
      type: String,
      required: [true, 'PDF document URL is required'],
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
tenderSchema.index({ referenceNumber: 1 });
tenderSchema.index({ title: 'text', description: 'text' });
tenderSchema.index({ status: 1 });
tenderSchema.index({ category: 1 });
tenderSchema.index({ published: 1 });
tenderSchema.index({ closingDate: 1 });
tenderSchema.index({ openingDate: 1 });
tenderSchema.index({ createdAt: -1 });

export const TenderModel = mongoose.model<ITender>('Tender', tenderSchema);
