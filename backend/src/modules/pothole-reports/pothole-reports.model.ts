import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type Severity = 'low' | 'medium' | 'high';
export type ReportStatus = 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';

export interface IPotholeReport extends MongooseDocument {
  deviceId: string; // Keep for backward compatibility
  userEmail?: string; // User's email account for logged-in users
  referenceCode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  town: string;
  region: string;
  roadName: string;
  photoUrl: string;
  severity?: Severity; // Admin-only field
  description?: string;
  status: ReportStatus;
  assignedTo?: string;
  adminNotes?: string;
  repairPhotoUrl?: string;
  fixedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const potholeReportSchema = new Schema<IPotholeReport>(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      sparse: true, // Index only documents that have this field
    },
    referenceCode: {
      type: String,
      required: [true, 'Reference code is required'],
      unique: true,
      trim: true,
    },
    location: {
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
    town: {
      type: String,
      required: [true, 'Town is required'],
      trim: true,
      default: 'Unknown',
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      default: 'Unknown',
    },
    roadName: {
      type: String,
      required: [true, 'Road name is required'],
      trim: true,
      maxlength: [200, 'Road name cannot exceed 200 characters'],
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo URL is required'],
      trim: true,
    },
    severity: {
      type: String,
      required: false, // Admin-only field - not required on creation
      enum: ['low', 'medium', 'high'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending', 'assigned', 'in-progress', 'fixed', 'duplicate', 'invalid'],
      default: 'pending',
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
    },
    repairPhotoUrl: {
      type: String,
      trim: true,
    },
    fixedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
potholeReportSchema.index({ deviceId: 1, createdAt: -1 });
potholeReportSchema.index({ userEmail: 1, createdAt: -1 }); // Index for user email queries
potholeReportSchema.index({ status: 1, createdAt: -1 });
potholeReportSchema.index({ region: 1, town: 1 });
potholeReportSchema.index({ createdAt: -1 });
// Note: referenceCode index is already created by unique: true in schema definition

// Auto-set fixedAt when status changes to 'fixed'
potholeReportSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'fixed' && !this.fixedAt) {
    this.fixedAt = new Date();
  }
  next();
});

export const PotholeReportModel = mongoose.model<IPotholeReport>('PotholeReport', potholeReportSchema);

