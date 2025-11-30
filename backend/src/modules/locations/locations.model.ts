import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ILocation extends MongooseDocument {
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      maxlength: [100, 'Region cannot exceed 100 characters'],
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Contact number cannot exceed 50 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
locationSchema.index({ region: 1 });
locationSchema.index({ name: 1 });
locationSchema.index({ createdAt: -1 });

export const LocationModel = mongoose.model<ILocation>('Location', locationSchema);
