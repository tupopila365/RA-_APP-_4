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
  changedBy: string;
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

export interface IPLN {
  id?: number;
  referenceId: string;
  trackingPin: string;
  transactionType: string;
  idType: IdType;
  trafficRegisterNumber?: string;
  businessRegNumber?: string;
  surname: string;
  initials: string;
  businessName?: string;
  postalAddress: IAddress;
  streetAddress: IAddress;
  telephoneHome?: IPhoneNumber;
  telephoneDay?: IPhoneNumber;
  cellNumber?: IPhoneNumber;
  email?: string;
  trafficRegisterNumber_encrypted?: string;
  businessRegNumber_encrypted?: string;
  surname_encrypted: string;
  initials_encrypted: string;
  businessName_encrypted?: string;
  email_encrypted?: string;
  trafficRegisterNumber_hash?: string;
  businessRegNumber_hash?: string;
  surname_hash: string;
  email_hash?: string;
  fullName?: string;
  idNumber?: string;
  phoneNumber?: string;
  fullName_encrypted?: string;
  idNumber_encrypted?: string;
  phoneNumber_encrypted?: string;
  fullName_hash?: string;
  idNumber_hash?: string;
  plateFormat: PlateFormat;
  quantity: 1 | 2;
  plateChoices: IPlateChoice[];
  hasRepresentative?: boolean;
  representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
  representativeIdNumber?: string;
  representativeSurname?: string;
  representativeInitials?: string;
  hasVehicle?: boolean;
  currentLicenceNumber?: string;
  vehicleRegisterNumber?: string;
  chassisNumber?: string;
  vehicleMake?: string;
  seriesName?: string;
  declarationAccepted: boolean;
  declarationDate: Date;
  declarationPlace: string;
  declarationRole?: 'applicant' | 'proxy' | 'representative';
  documentUrl: string;
  status: PLNStatus;
  statusHistory: IStatusHistory[];
  adminComments?: string;
  paymentDeadline?: Date;
  paymentReceivedAt?: Date;
  assignedTo?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  internalNotes?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  processedBy?: string;
  processedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  plateOrderNumber?: string;
  plateSupplier?: string;
  plateOrderedAt?: Date;
  plateDeliveredAt?: Date;
  plateCollectedAt?: Date;
  plateCollectedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
