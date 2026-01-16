import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IProcurementOpeningRegister extends MongooseDocument {
  type: 'opportunities' | 'rfq';
  reference: string;
  description: string;
  bidOpeningDate: Date;
  status: 'open' | 'closed';
  noticeUrl: string;
  noticeFileName: string;
  category?: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works';
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const procurementOpeningRegisterSchema = new Schema<IProcurementOpeningRegister>(
  {
    type: {
      type: String,
      enum: ['opportunities', 'rfq'],
      required: [true, 'Type is required'],
    },
    reference: {
      type: String,
      required: [true, 'Reference is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Reference cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    bidOpeningDate: {
      type: Date,
      required: [true, 'Bid opening date is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      required: [true, 'Status is required'],
    },
    noticeUrl: {
      type: String,
      required: [true, 'Notice URL is required'],
      trim: true,
    },
    noticeFileName: {
      type: String,
      required: [true, 'Notice filename is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Consultancy', 'Non-Consultancy', 'Goods', 'Works'],
      trim: true,
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
procurementOpeningRegisterSchema.index({ type: 1 });
procurementOpeningRegisterSchema.index({ status: 1 });
procurementOpeningRegisterSchema.index({ category: 1 });
procurementOpeningRegisterSchema.index({ published: 1 });
// Note: reference index is already created by unique: true in schema definition
procurementOpeningRegisterSchema.index({ bidOpeningDate: -1 });
// Text index for description only (reference has unique index, so excluded from text index)
procurementOpeningRegisterSchema.index({ description: 'text' });
procurementOpeningRegisterSchema.index({ createdAt: -1 });
procurementOpeningRegisterSchema.index({ publishedAt: -1 });

// Automatically set publishedAt when published is set to true
procurementOpeningRegisterSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const ProcurementOpeningRegisterModel = mongoose.model<IProcurementOpeningRegister>(
  'ProcurementOpeningRegister',
  procurementOpeningRegisterSchema
);

