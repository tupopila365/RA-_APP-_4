import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

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

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Document description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    category: {
      type: String,
      enum: {
        values: ['policy', 'tender', 'report', 'other'],
        message: 'Category must be one of: policy, tender, report, other',
      },
      required: [true, 'Category is required'],
    },
    indexed: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader information is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
documentSchema.index({ title: 'text', description: 'text' });
documentSchema.index({ category: 1 });
documentSchema.index({ indexed: 1 });
documentSchema.index({ createdAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
