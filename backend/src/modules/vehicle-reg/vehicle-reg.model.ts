import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type VehicleRegStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'REGISTERED'
  | 'EXPIRED';

export interface IStatusHistory {
  status: VehicleRegStatus;
  changedBy: string;
  timestamp: Date;
  comment?: string;
}

export type IdType = 'Traffic Register Number' | 'Namibia ID-doc' | 'Business Reg. No';
export type PersonType = 'male' | 'female' | 'one-man business' | 'Private company' | 'closed corporation' | 'other';
export type DrivenType = 'self-propelled' | 'trailer' | 'semi-trailer' | 'trailer drawn by tractor';
export type FuelType = 'petrol' | 'diesel' | 'other';
export type TransmissionType = 'manual' | 'semi-automatic' | 'automatic';
export type MainColour = 'white' | 'red' | 'blue' | 'other';
export type OwnershipType = 'private' | 'business' | 'motor dealer';
export type RegistrationReason = 'first registration' | 'ownership transfer' | 're-register' | 'amalgamation' | 'built-up';

export interface IAddress {
  line1: string;
  line2?: string;
  line3?: string;
}

export interface IPhoneNumber {
  code: string;
  number: string;
}

export interface IVehicleReg extends MongooseDocument {
  referenceId: string;
  trackingPin: string;
  
  // Section A - Owner Particulars
  idType: IdType;
  identificationNumber: string;
  personType?: PersonType;
  surname?: string;
  initials?: string;
  businessName?: string;
  postalAddress: IAddress;
  streetAddress: IAddress;
  telephoneDay?: IPhoneNumber;
  
  // Section B - Organization's Proxy (optional)
  hasProxy?: boolean;
  proxyIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  proxyIdNumber?: string;
  proxySurname?: string;
  proxyInitials?: string;
  
  // Section C - Organization's Representative (optional)
  hasRepresentative?: boolean;
  representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  representativeIdNumber?: string;
  representativeSurname?: string;
  representativeInitials?: string;
  
  // Section D - Declaration
  declarationAccepted: boolean;
  declarationDate: Date;
  declarationPlace: string;
  declarationRole?: 'owner' | 'proxy' | 'representative';
  declarationSignature?: string;
  
  // Section E - Vehicle Particulars
  registrationNumber?: string; // N prefix + numbers
  make: string;
  seriesName: string;
  vehicleCategory?: string;
  drivenType: DrivenType;
  vehicleDescription?: string;
  netPower?: string; // kW
  engineCapacity?: string; // cm³
  fuelType: FuelType;
  fuelTypeOther?: string;
  totalMass?: string; // kg
  grossVehicleMass?: string; // kg
  maxPermissibleVehicleMass?: string; // kg (only if GVM >= 3500kg)
  maxPermissibleDrawingMass?: string; // kg (only if GVM >= 3500kg)
  transmission: TransmissionType;
  mainColour: MainColour;
  mainColourOther?: string;
  usedForTransportation?: string;
  economicSector?: string;
  odometerReading?: string;
  odometerReadingKm?: string;
  vehicleStreetAddress?: IAddress; // If different from owner's address
  ownershipType: OwnershipType;
  usedOnPublicRoad: boolean;
  
  // Section F - For Office Use Only (admin fields)
  chassisNumber?: string;
  engineNumber?: string;
  feesPaidRegistration?: string; // N$ amount
  receiptNumberRegistration?: string;
  feesPaidLicensing?: string; // N$ amount
  receiptNumberLicensing?: string;
  roadWorthinessCompliant?: boolean;
  roadWorthinessTestDate?: Date;
  roadWorthinessCertificateNumber?: string;
  registrationReason?: RegistrationReason;
  policeClearanceSubmitted?: boolean;
  transactionEffectiveDate?: Date;
  firstLicensingLiabilityDate?: Date;
  registrationCertificateControlNumber?: string;
  vehicleStatus?: 'new' | 'used' | 'built-up' | 'reconstructed';
  
  // Document and status
  documentUrl: string; // Certified ID document
  status: VehicleRegStatus;
  statusHistory: IStatusHistory[];
  adminComments?: string;
  paymentDeadline?: Date;
  paymentReceivedAt?: Date;
  
  // Additional admin fields
  assignedTo?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  internalNotes?: string;
  
  // Payment information
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Processing information
  processedBy?: string;
  processedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Registration information
  registrationNumberAssigned?: string;
  registrationDate?: Date;
  registrationCertificateUrl?: string;
  
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
        'REGISTERED',
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

const vehicleRegSchema = new Schema<IVehicleReg>(
  {
    referenceId: {
      type: String,
      required: [true, 'Reference ID is required'],
      unique: true,
      trim: true,
    },
    trackingPin: {
      type: String,
      required: [true, 'Tracking PIN is required'],
      default: '12345',
      trim: true,
    },
    // Section A
    idType: {
      type: String,
      required: [true, 'ID type is required'],
      enum: ['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'],
    },
    identificationNumber: {
      type: String,
      required: [true, 'Identification number is required'],
      trim: true,
    },
    personType: {
      type: String,
      enum: ['male', 'female', 'one-man business', 'Private company', 'closed corporation', 'other'],
    },
    surname: {
      type: String,
      trim: true,
      maxlength: [100, 'Surname cannot exceed 100 characters'],
    },
    initials: {
      type: String,
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
    telephoneDay: {
      type: phoneNumberSchema,
    },
    // Section B
    hasProxy: {
      type: Boolean,
      default: false,
    },
    proxyIdType: {
      type: String,
      enum: ['Traffic Register Number', 'Namibia ID-doc'],
    },
    proxyIdNumber: {
      type: String,
      trim: true,
    },
    proxySurname: {
      type: String,
      trim: true,
      maxlength: [100, 'Proxy surname cannot exceed 100 characters'],
    },
    proxyInitials: {
      type: String,
      trim: true,
      maxlength: [10, 'Proxy initials cannot exceed 10 characters'],
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
      enum: ['owner', 'proxy', 'representative'],
      default: 'owner',
    },
    declarationSignature: {
      type: String,
      trim: true,
    },
    // Section E
    registrationNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Registration number cannot exceed 20 characters'],
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
      maxlength: [100, 'Make cannot exceed 100 characters'],
    },
    seriesName: {
      type: String,
      required: [true, 'Series name is required'],
      trim: true,
      maxlength: [200, 'Series name cannot exceed 200 characters'],
    },
    vehicleCategory: {
      type: String,
      trim: true,
      maxlength: [100, 'Vehicle category cannot exceed 100 characters'],
    },
    drivenType: {
      type: String,
      required: [true, 'Driven type is required'],
      enum: ['self-propelled', 'trailer', 'semi-trailer', 'trailer drawn by tractor'],
    },
    vehicleDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Vehicle description cannot exceed 200 characters'],
    },
    netPower: {
      type: String,
      trim: true,
    },
    engineCapacity: {
      type: String,
      trim: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['petrol', 'diesel', 'other'],
    },
    fuelTypeOther: {
      type: String,
      trim: true,
      maxlength: [50, 'Fuel type other cannot exceed 50 characters'],
    },
    totalMass: {
      type: String,
      trim: true,
    },
    grossVehicleMass: {
      type: String,
      trim: true,
    },
    maxPermissibleVehicleMass: {
      type: String,
      trim: true,
    },
    maxPermissibleDrawingMass: {
      type: String,
      trim: true,
    },
    transmission: {
      type: String,
      required: [true, 'Transmission is required'],
      enum: ['manual', 'semi-automatic', 'automatic'],
    },
    mainColour: {
      type: String,
      required: [true, 'Main colour is required'],
      enum: ['white', 'red', 'blue', 'other'],
    },
    mainColourOther: {
      type: String,
      trim: true,
      maxlength: [50, 'Main colour other cannot exceed 50 characters'],
    },
    usedForTransportation: {
      type: String,
      trim: true,
      maxlength: [200, 'Used for transportation cannot exceed 200 characters'],
    },
    economicSector: {
      type: String,
      trim: true,
      maxlength: [100, 'Economic sector cannot exceed 100 characters'],
    },
    odometerReading: {
      type: String,
      trim: true,
    },
    odometerReadingKm: {
      type: String,
      trim: true,
    },
    vehicleStreetAddress: {
      type: addressSchema,
    },
    ownershipType: {
      type: String,
      required: [true, 'Ownership type is required'],
      enum: ['private', 'business', 'motor dealer'],
    },
    usedOnPublicRoad: {
      type: Boolean,
      required: [true, 'Used on public road is required'],
      default: true,
    },
    // Section F - Office use only
    chassisNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Chassis number cannot exceed 50 characters'],
    },
    engineNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Engine number cannot exceed 50 characters'],
    },
    feesPaidRegistration: {
      type: String,
      trim: true,
    },
    receiptNumberRegistration: {
      type: String,
      trim: true,
    },
    feesPaidLicensing: {
      type: String,
      trim: true,
    },
    receiptNumberLicensing: {
      type: String,
      trim: true,
    },
    roadWorthinessCompliant: {
      type: Boolean,
    },
    roadWorthinessTestDate: {
      type: Date,
    },
    roadWorthinessCertificateNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Roadworthiness certificate number cannot exceed 100 characters'],
    },
    registrationReason: {
      type: String,
      enum: ['first registration', 'ownership transfer', 're-register', 'amalgamation', 'built-up'],
    },
    policeClearanceSubmitted: {
      type: Boolean,
    },
    transactionEffectiveDate: {
      type: Date,
    },
    firstLicensingLiabilityDate: {
      type: Date,
    },
    registrationCertificateControlNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Registration certificate control number cannot exceed 100 characters'],
    },
    vehicleStatus: {
      type: String,
      enum: ['new', 'used', 'built-up', 'reconstructed'],
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
        'REGISTERED',
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
    // Registration information
    registrationNumberAssigned: {
      type: String,
      trim: true,
      maxlength: [20, 'Registration number assigned cannot exceed 20 characters'],
    },
    registrationDate: {
      type: Date,
    },
    registrationCertificateUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vehicleRegSchema.index({ referenceId: 1 });
vehicleRegSchema.index({ identificationNumber: 1 });
vehicleRegSchema.index({ status: 1, createdAt: -1 });
vehicleRegSchema.index({ createdAt: -1 });
vehicleRegSchema.index({ assignedTo: 1 });
vehicleRegSchema.index({ priority: 1 });
vehicleRegSchema.index({ surname: 1 });
vehicleRegSchema.index({ businessName: 1 });
vehicleRegSchema.index({ make: 1 });
vehicleRegSchema.index({ chassisNumber: 1 });

// Auto-add initial status to history on creation
vehicleRegSchema.pre('save', function (next) {
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

export const VehicleRegModel = mongoose.model<IVehicleReg>('VehicleReg', vehicleRegSchema);
