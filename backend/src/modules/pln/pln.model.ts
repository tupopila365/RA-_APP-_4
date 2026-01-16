import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { FieldEncryption } from '../../utils/encryption';

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

export type IdType = 'Traffic Register Number' | 'Namibia ID-doc' | 'Business Reg. No';
export type PlateFormat = 'Long/German' | 'Normal' | 'American' | 'Square' | 'Small motorcycle';

export interface IAddress {
  line1: string;
  line2?: string;
  line3?: string;
}

export interface IPhoneNumber {
  code: string;
  number: string;
}

export interface IPLN extends MongooseDocument {
  referenceId: string;
  trackingPin: string; // Simple tracking PIN for users
  
  // Transaction Type (fixed to "New Personalised Licence Number")
  transactionType: string;
  
  // Section A - Owner/Transferor
  idType: IdType;
  trafficRegisterNumber?: string;
  businessRegNumber?: string;
  surname: string;
  initials: string;
  businessName?: string; // For businesses
  postalAddress: IAddress;
  streetAddress: IAddress;
  telephoneHome?: IPhoneNumber;
  telephoneDay?: IPhoneNumber;
  cellNumber?: IPhoneNumber;
  email?: string;
  
  // Encrypted sensitive fields
  trafficRegisterNumber_encrypted?: string;
  businessRegNumber_encrypted?: string;
  surname_encrypted: string;
  initials_encrypted: string;
  businessName_encrypted?: string;
  email_encrypted?: string;
  
  // Hashed fields for searching
  trafficRegisterNumber_hash?: string;
  businessRegNumber_hash?: string;
  surname_hash: string;
  email_hash?: string;
  
  // Legacy fields (for backward compatibility) - also encrypted
  fullName?: string; // Computed from surname + initials
  idNumber?: string; // Computed based on idType
  phoneNumber?: string; // Computed from phone numbers
  fullName_encrypted?: string;
  idNumber_encrypted?: string;
  phoneNumber_encrypted?: string;
  
  // Legacy hashed fields
  fullName_hash?: string;
  idNumber_hash?: string;
  
  // Section B - Personalised Number Plate
  plateFormat: PlateFormat;
  quantity: 1 | 2;
  plateChoices: IPlateChoice[]; // Array of 3 choices
  
  // Section C - Representative/Proxy (optional)
  hasRepresentative?: boolean;
  representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  representativeIdNumber?: string;
  representativeSurname?: string;
  representativeInitials?: string;
  
  // Section D - Vehicle Particulars (optional)
  hasVehicle?: boolean;
  currentLicenceNumber?: string;
  vehicleRegisterNumber?: string;
  chassisNumber?: string;
  vehicleMake?: string;
  seriesName?: string;
  
  // Section E - Declaration
  declarationAccepted: boolean;
  declarationDate: Date;
  declarationPlace: string;
  declarationRole?: 'applicant' | 'proxy' | 'representative';
  
  // Document and status
  documentUrl: string; // Certified ID document
  status: PLNStatus;
  statusHistory: IStatusHistory[];
  adminComments?: string;
  paymentDeadline?: Date;
  paymentReceivedAt?: Date;
  
  // Additional admin fields
  assignedTo?: string; // Admin user ID
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[]; // For categorization
  internalNotes?: string; // Internal admin notes
  
  // Payment information
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Processing information
  processedBy?: string; // Admin who processed
  processedAt?: Date;
  reviewedBy?: string; // Admin who reviewed
  reviewedAt?: Date;
  
  // Plate production information
  plateOrderNumber?: string;
  plateSupplier?: string;
  plateOrderedAt?: Date;
  plateDeliveredAt?: Date;
  plateCollectedAt?: Date;
  plateCollectedBy?: string;
  
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
      maxlength: [8, 'Plate text cannot exceed 8 characters'],
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

const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    line3: { type: String, trim: true },
  },
  { _id: false }
);

const phoneNumberSchema = new Schema<IPhoneNumber>(
  {
    code: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
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
    trackingPin: {
      type: String,
      required: [true, 'Tracking PIN is required'],
      default: '12345',
      trim: true,
    },
    transactionType: {
      type: String,
      default: 'New Personalised Licence Number',
      trim: true,
    },
    // Section A
    idType: {
      type: String,
      required: [true, 'ID type is required'],
      enum: ['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'],
    },
    trafficRegisterNumber: {
      type: String,
      trim: true,
    },
    businessRegNumber: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      required: [true, 'Surname is required'],
      trim: true,
      maxlength: [100, 'Surname cannot exceed 100 characters'],
    },
    initials: {
      type: String,
      required: [true, 'Initials are required'],
      trim: true,
      maxlength: [10, 'Initials cannot exceed 10 characters'],
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    postalAddress: {
      type: addressSchema,
      required: [true, 'Postal address is required'],
    },
    streetAddress: {
      type: addressSchema,
      required: [true, 'Street address is required'],
    },
    telephoneHome: {
      type: phoneNumberSchema,
    },
    telephoneDay: {
      type: phoneNumberSchema,
    },
    cellNumber: {
      type: phoneNumberSchema,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [200, 'Email cannot exceed 200 characters'],
    },
    // Legacy fields (for backward compatibility)
    fullName: {
      type: String,
      trim: true,
      maxlength: [200, 'Full name cannot exceed 200 characters'],
    },
    idNumber: {
      type: String,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    // Section B
    plateFormat: {
      type: String,
      required: [true, 'Plate format is required'],
      enum: ['Long/German', 'Normal', 'American', 'Square', 'Small motorcycle'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      enum: [1, 2],
    },
    plateChoices: {
      type: [plateChoiceSchema],
      required: [true, 'Plate choices are required'],
      validate: {
        validator: (choices: IPlateChoice[]) => choices.length === 3,
        message: 'Exactly 3 plate choices are required',
      },
    },
    // Section C
    hasRepresentative: {
      type: Boolean,
      default: false,
    },
    representativeIdType: {
      type: String,
      enum: ['Traffic Register Number', 'Namibia ID-doc'],
    },
    representativeIdNumber: {
      type: String,
      trim: true,
    },
    representativeSurname: {
      type: String,
      trim: true,
      maxlength: [100, 'Representative surname cannot exceed 100 characters'],
    },
    representativeInitials: {
      type: String,
      trim: true,
      maxlength: [10, 'Representative initials cannot exceed 10 characters'],
    },
    // Section D
    currentLicenceNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Current licence number cannot exceed 20 characters'],
    },
    vehicleRegisterNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Vehicle register number cannot exceed 20 characters'],
    },
    chassisNumber: {
      type: String,
      trim: true,
      maxlength: [30, 'Chassis number cannot exceed 30 characters'],
    },
    vehicleMake: {
      type: String,
      trim: true,
      maxlength: [100, 'Vehicle make cannot exceed 100 characters'],
    },
    seriesName: {
      type: String,
      trim: true,
      maxlength: [100, 'Series name cannot exceed 100 characters'],
    },
    // Section E
    declarationAccepted: {
      type: Boolean,
      required: [true, 'Declaration acceptance is required'],
      default: false,
    },
    declarationDate: {
      type: Date,
      required: [true, 'Declaration date is required'],
      default: Date.now,
    },
    declarationPlace: {
      type: String,
      required: [true, 'Declaration place is required'],
      trim: true,
      maxlength: [100, 'Declaration place cannot exceed 100 characters'],
    },
    declarationRole: {
      type: String,
      enum: ['applicant', 'proxy', 'representative'],
      default: 'applicant',
    },
    // Document and status
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
    // Additional admin fields
    assignedTo: {
      type: String,
      trim: true,
      maxlength: [200, 'Assigned to cannot exceed 200 characters'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    tags: {
      type: [String],
      default: [],
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
    },
    // Payment information
    paymentAmount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment method cannot exceed 100 characters'],
    },
    paymentReference: {
      type: String,
      trim: true,
      maxlength: [100, 'Payment reference cannot exceed 100 characters'],
    },
    // Processing information
    processedBy: {
      type: String,
      trim: true,
      maxlength: [200, 'Processed by cannot exceed 200 characters'],
    },
    processedAt: {
      type: Date,
    },
    reviewedBy: {
      type: String,
      trim: true,
      maxlength: [200, 'Reviewed by cannot exceed 200 characters'],
    },
    reviewedAt: {
      type: Date,
    },
    // Plate production information
    plateOrderNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Plate order number cannot exceed 100 characters'],
    },
    plateSupplier: {
      type: String,
      trim: true,
      maxlength: [200, 'Plate supplier cannot exceed 200 characters'],
    },
    plateOrderedAt: {
      type: Date,
    },
    plateDeliveredAt: {
      type: Date,
    },
    plateCollectedAt: {
      type: Date,
    },
    plateCollectedBy: {
      type: String,
      trim: true,
      maxlength: [200, 'Plate collected by cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
plnSchema.index({ referenceId: 1 });
plnSchema.index({ idNumber: 1 });
plnSchema.index({ trafficRegisterNumber: 1 });
plnSchema.index({ businessRegNumber: 1 });
plnSchema.index({ status: 1, createdAt: -1 });
plnSchema.index({ createdAt: -1 });
plnSchema.index({ assignedTo: 1 });
plnSchema.index({ priority: 1 });
plnSchema.index({ 'plateChoices.text': 1 });
plnSchema.index({ surname: 1 });
plnSchema.index({ businessName: 1 });
plnSchema.index({ email: 1 });

// Auto-compute legacy fields for backward compatibility
plnSchema.pre('save', function (next) {
  // Compute fullName from surname + initials
  if (this.surname && this.initials && !this.fullName) {
    this.fullName = `${this.surname} ${this.initials}`.trim();
  }
  
  // Compute idNumber based on idType
  if (!this.idNumber) {
    if (this.idType === 'Traffic Register Number' && this.trafficRegisterNumber) {
      this.idNumber = this.trafficRegisterNumber;
    } else if (this.idType === 'Namibia ID-doc' && this.trafficRegisterNumber) {
      this.idNumber = this.trafficRegisterNumber;
    } else if (this.idType === 'Business Reg. No' && this.businessRegNumber) {
      this.idNumber = this.businessRegNumber;
    }
  }
  
  // Compute phoneNumber from cellNumber or telephoneDay
  if (!this.phoneNumber) {
    if (this.cellNumber) {
      this.phoneNumber = `${this.cellNumber.code}${this.cellNumber.number}`;
    } else if (this.telephoneDay) {
      this.phoneNumber = `${this.telephoneDay.code}${this.telephoneDay.number}`;
    } else if (this.telephoneHome) {
      this.phoneNumber = `${this.telephoneHome.code}${this.telephoneHome.number}`;
    }
  }
  
  // Auto-add initial status to history on creation
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



