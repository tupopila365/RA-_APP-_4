import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IVacancy extends MongooseDocument {
  title: string;
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: Date;
  pdfUrl?: string;
  published: boolean;
  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactTelephone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<IVacancy>(
  {
    title: {
      type: String,
      required: [true, 'Vacancy title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Vacancy type is required'],
      enum: {
        values: ['full-time', 'part-time', 'bursary', 'internship'],
        message: 'Type must be one of: full-time, part-time, bursary, internship',
      },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requirements: {
      type: [String],
      required: [true, 'Requirements are required'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one requirement must be provided',
      },
    },
    responsibilities: {
      type: [String],
      required: [true, 'Responsibilities are required'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one responsibility must be provided',
      },
    },
    salary: {
      type: String,
      trim: true,
    },
    closingDate: {
      type: Date,
      required: [true, 'Closing date is required'],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: 'Closing date must be in the future',
      },
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    // Contact information fields
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // Only validate if value is provided
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    contactTelephone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
vacancySchema.index({ title: 'text', description: 'text' });
vacancySchema.index({ type: 1 });
vacancySchema.index({ department: 1 });
vacancySchema.index({ location: 1 });
vacancySchema.index({ published: 1 });
vacancySchema.index({ closingDate: 1 });
vacancySchema.index({ createdAt: -1 });

export const VacancyModel = mongoose.model<IVacancy>('Vacancy', vacancySchema);
