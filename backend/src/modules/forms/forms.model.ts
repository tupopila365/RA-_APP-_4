import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IFormDocument {
  title: string;
  url: string;
  fileName: string;
}

export interface IForm extends MongooseDocument {
  name: string;
  category: 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy';
  documents: IFormDocument[];
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const formDocumentSchema = new Schema<IFormDocument>(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    url: {
      type: String,
      required: [true, 'Document URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Document filename is required'],
      trim: true,
    },
  },
  { _id: true }
);

const formSchema = new Schema<IForm>(
  {
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
      maxlength: [200, 'Form name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['Procurement', 'Roads & Infrastructure', 'Plans & Strategies', 'Conferences & Events', 'Legislation & Policy'],
      required: [true, 'Category is required'],
    },
    documents: {
      type: [formDocumentSchema],
      required: [true, 'At least one document is required'],
      validate: {
        validator: function(docs: IFormDocument[]) {
          return docs && docs.length > 0;
        },
        message: 'At least one document is required',
      },
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
formSchema.index({ category: 1 });
formSchema.index({ published: 1 });
formSchema.index({ name: 'text' });
formSchema.index({ createdAt: -1 });
formSchema.index({ publishedAt: -1 });

// Automatically set publishedAt when published is set to true
formSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const FormModel = mongoose.model<IForm>('Form', formSchema);
