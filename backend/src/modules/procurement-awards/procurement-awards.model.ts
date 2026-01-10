import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IExecutiveSummary {
  title: string;
  url: string;
  fileName: string;
}

export interface IProcurementAward extends MongooseDocument {
  type: 'opportunities' | 'rfq';
  procurementReference: string;
  description: string;
  executiveSummary: IExecutiveSummary;
  successfulBidder: string;
  dateAwarded: Date;
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const executiveSummarySchema = new Schema<IExecutiveSummary>(
  {
    title: {
      type: String,
      required: [true, 'Executive summary title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    url: {
      type: String,
      required: [true, 'Executive summary URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Executive summary filename is required'],
      trim: true,
    },
  },
  { _id: false }
);

const procurementAwardSchema = new Schema<IProcurementAward>(
  {
    type: {
      type: String,
      enum: ['opportunities', 'rfq'],
      required: [true, 'Type is required'],
    },
    procurementReference: {
      type: String,
      required: [true, 'Procurement reference is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Procurement reference cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    executiveSummary: {
      type: executiveSummarySchema,
      required: [true, 'Executive summary is required'],
    },
    successfulBidder: {
      type: String,
      required: [true, 'Successful bidder is required'],
      trim: true,
      maxlength: [500, 'Successful bidder cannot exceed 500 characters'],
    },
    dateAwarded: {
      type: Date,
      required: [true, 'Date awarded is required'],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
procurementAwardSchema.index({ type: 1 });
procurementAwardSchema.index({ published: 1 });
procurementAwardSchema.index({ procurementReference: 1 });
procurementAwardSchema.index({ dateAwarded: -1 });
procurementAwardSchema.index({ description: 'text', procurementReference: 'text', successfulBidder: 'text' });
procurementAwardSchema.index({ createdAt: -1 });
procurementAwardSchema.index({ publishedAt: -1 });

// Automatically set publishedAt when published is set to true
procurementAwardSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const ProcurementAwardModel = mongoose.model<IProcurementAward>(
  'ProcurementAward',
  procurementAwardSchema
);

