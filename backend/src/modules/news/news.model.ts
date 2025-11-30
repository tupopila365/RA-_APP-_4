import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface INews extends MongooseDocument {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'News content is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'News excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
newsSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
newsSchema.index({ category: 1 });
newsSchema.index({ published: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ createdAt: -1 });

// Automatically set publishedAt when published is set to true
newsSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const NewsModel = mongoose.model<INews>('News', newsSchema);
