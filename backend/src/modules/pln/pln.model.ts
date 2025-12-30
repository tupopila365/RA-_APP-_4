import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type PLNStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PLATES_ORDERED'
  | 'READY_FOR_COLLECTION'
  | 'EXPIRED';

export interface IStatusHistory {
  status: PLNStatus;
  changedBy: string; // Admin name or system
  timestamp: Date;
  comment?: string;
}

export interface IPlateChoice {
  text: string;
  meaning: string;
}

export interface IPLN extends MongooseDocument {
  referenceId: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  plateChoices: IPlateChoice[]; // Array of 3 choices
  documentUrl: string; // Certified ID document
  status: PLNStatus;
  statusHistory: IStatusHistory[];
  adminComments?: string;
  paymentDeadline?: Date;
  paymentReceivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'DECLINED',
        'PAYMENT_PENDING',
        'PAID',
        'PLATES_ORDERED',
        'READY_FOR_COLLECTION',
        'EXPIRED',
      ],
    },
    changedBy: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const plateChoiceSchema = new Schema<IPlateChoice>(
  {
    text: {
      type: String,
      required: [true, 'Plate text is required'],
      trim: true,
      maxlength: [7, 'Plate text cannot exceed 7 characters'],
      uppercase: true,
    },
    meaning: {
      type: String,
      required: [true, 'Plate meaning is required'],
      trim: true,
      maxlength: [500, 'Meaning cannot exceed 500 characters'],
    },
  },
  { _id: false }
);

const plnSchema = new Schema<IPLN>(
  {
    referenceId: {
      type: String,
      required: [true, 'Reference ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [200, 'Full name cannot exceed 200 characters'],
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    plateChoices: {
      type: [plateChoiceSchema],
      required: [true, 'Plate choices are required'],
      validate: {
        validator: (choices: IPlateChoice[]) => choices.length === 3,
        message: 'Exactly 3 plate choices are required',
      },
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'DECLINED',
        'PAYMENT_PENDING',
        'PAID',
        'PLATES_ORDERED',
        'READY_FOR_COLLECTION',
        'EXPIRED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    adminComments: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin comments cannot exceed 2000 characters'],
    },
    paymentDeadline: {
      type: Date,
    },
    paymentReceivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
plnSchema.index({ referenceId: 1 });
plnSchema.index({ idNumber: 1 });
plnSchema.index({ status: 1, createdAt: -1 });
plnSchema.index({ createdAt: -1 });
plnSchema.index({ 'plateChoices.text': 1 });

// Auto-add initial status to history on creation
plnSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      changedBy: 'System',
      timestamp: new Date(),
      comment: 'Application submitted',
    });
  }
  next();
});

export const PLNModel = mongoose.model<IPLN>('PLN', plnSchema);


