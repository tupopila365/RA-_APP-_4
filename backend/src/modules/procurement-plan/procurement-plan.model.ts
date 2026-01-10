import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IProcurementPlan extends MongooseDocument {
  fiscalYear: string;
  documentUrl: string;
  documentFileName: string;
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const procurementPlanSchema = new Schema<IProcurementPlan>(
  {
    fiscalYear: {
      type: String,
      required: [true, 'Fiscal year is required'],
      trim: true,
      maxlength: [50, 'Fiscal year cannot exceed 50 characters'],
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required'],
      trim: true,
    },
    documentFileName: {
      type: String,
      required: [true, 'Document filename is required'],
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
procurementPlanSchema.index({ fiscalYear: 1 });
procurementPlanSchema.index({ published: 1 });
procurementPlanSchema.index({ fiscalYear: 'text' });
procurementPlanSchema.index({ createdAt: -1 });
procurementPlanSchema.index({ publishedAt: -1 });

// Automatically set publishedAt when published is set to true
procurementPlanSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const ProcurementPlanModel = mongoose.model<IProcurementPlan>(
  'ProcurementPlan',
  procurementPlanSchema
);

