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
  submissionLink?: string; // Link for online application submission
  submissionEmail?: string; // Alternative email for applications
  submissionInstructions?: string; // Instructions for how to apply
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
      enum: {
        values: [
          // Core Departments
          'Construction & Renewal',
          'Road Maintenance',
          'Road Traffic Planning & Advisory',
          'Road Management (RMS)',
          'Transport Information & Regulatory Services (NaTIS)',
          'Road & Transport Monitoring/Inspectorate',
          // Support Departments
          'Human Resources',
          'Finance / Accounting',
          'Corporate Communications',
          'Administration / Corporate Services',
          'Legal / Compliance',
          'ICT / Business Systems',
          'Procurement',
          "CEO's Office",
        ],
        message: 'Invalid department selected',
      },
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
      maxlength: [100, 'Contact name cannot exceed 100 characters'],
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
      maxlength: [20, 'Contact telephone cannot exceed 20 characters'],
    },
    submissionLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Only validate if value is provided
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Submission link must be a valid URL',
      },
    },
    submissionEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // Only validate if value is provided
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid submission email format',
      },
    },
    submissionInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Submission instructions cannot exceed 500 characters'],
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

// Pre-save hook for advanced closing date validation
vacancySchema.pre('save', function(next) {
  // Only validate closing date for new documents or when closing date is modified
  if (this.isNew || this.isModified('closingDate')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const closingDate = new Date(this.closingDate);
    closingDate.setHours(0, 0, 0, 0); // Set to start of closing date
    
    if (closingDate < today) {
      const error = new Error('Closing date must be today or in the future');
      return next(error);
    }
  }
  next();
});

export const VacancyModel = mongoose.model<IVacancy>('Vacancy', vacancySchema);
