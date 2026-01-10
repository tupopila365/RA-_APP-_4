import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IProcurementLegislation extends MongooseDocument {
  section: 'act' | 'regulations' | 'guidelines';
  title: string;
  documentUrl: string;
  documentFileName: string;
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const procurementLegislationSchema = new Schema<IProcurementLegislation>(
  {
    section: {
      type: String,
      enum: ['act', 'regulations', 'guidelines'],
      required: [true, 'Section is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
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
procurementLegislationSchema.index({ section: 1 });
procurementLegislationSchema.index({ published: 1 });
procurementLegislationSchema.index({ title: 'text' });
procurementLegislationSchema.index({ createdAt: -1 });
procurementLegislationSchema.index({ publishedAt: -1 });

// Automatically set publishedAt when published is set to true
procurementLegislationSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const ProcurementLegislationModel = mongoose.model<IProcurementLegislation>(
  'ProcurementLegislation',
  procurementLegislationSchema
);

