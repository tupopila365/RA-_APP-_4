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
  // NATIS-specific fields
  services?: string[];
  operatingHours?: {
    weekdays?: {
      open: string;
      close: string;
    };
    weekends?: {
      open: string;
      close: string;
    };
    publicHolidays?: {
      open: string;
      close: string;
    };
  };
  closedDays?: string[]; // Days when office is closed (e.g., ['Sunday', 'Saturday'])
  specialHours?: Array<{
    date: string; // ISO date string
    reason: string; // e.g., "Public Holiday", "Maintenance"
    closed: boolean;
    hours?: {
      open: string;
      close: string;
    };
  }>;
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
    // NATIS-specific fields
    services: [{
      type: String,
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    }],
    operatingHours: {
      weekdays: {
        open: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
        close: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
      },
      weekends: {
        open: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
        close: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
      },
      publicHolidays: {
        open: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
        close: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
      },
    },
    closedDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }],
    specialHours: [{
      date: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      },
      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Reason cannot exceed 200 characters'],
      },
      closed: {
        type: Boolean,
        required: true,
      },
      hours: {
        open: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
        close: {
          type: String,
          match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
        },
      },
    }],
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
