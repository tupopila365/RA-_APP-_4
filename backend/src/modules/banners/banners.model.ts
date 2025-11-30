import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IBanner extends MongooseDocument {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Banner order is required'],
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bannerSchema.index({ order: 1 });
bannerSchema.index({ active: 1 });
bannerSchema.index({ createdAt: -1 });

export const BannerModel = mongoose.model<IBanner>('Banner', bannerSchema);
