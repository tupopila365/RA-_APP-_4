import {
  VehicleRegStatus,
  IdType,
  PersonType,
  DrivenType,
  FuelType,
  TransmissionType,
  MainColour,
  OwnershipType,
  RegistrationReason,
  IAddress,
  IPhoneNumber,
} from './vehicle-reg.model';

export interface CreateVehicleRegDTO {
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
  declarationPlace: string;
  declarationRole?: 'owner' | 'proxy' | 'representative';
  
  // Section E - Vehicle Particulars
  registrationNumber?: string;
  make: string;
  seriesName: string;
  vehicleCategory?: string;
  drivenType: DrivenType;
  vehicleDescription?: string;
  netPower?: string;
  engineCapacity?: string;
  fuelType: FuelType;
  fuelTypeOther?: string;
  totalMass?: string;
  grossVehicleMass?: string;
  maxPermissibleVehicleMass?: string;
  maxPermissibleDrawingMass?: string;
  transmission: TransmissionType;
  mainColour: MainColour;
  mainColourOther?: string;
  usedForTransportation?: string;
  economicSector?: string;
  odometerReading?: string;
  odometerReadingKm?: string;
  vehicleStreetAddress?: IAddress;
  ownershipType: OwnershipType;
  usedOnPublicRoad: boolean;
  
  // Payment
  paymentAmount: number;
  paymentMethod?: string;
  paymentReference: string;

  // Application type (new or existing vehicle)
  applicationType: 'new' | 'existing';
  
  // Legacy fields (for backward compatibility)
  fullName?: string;
  idNumber?: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateStatusDTO {
  status: VehicleRegStatus;
  comment?: string;
}

export interface ListApplicationsQuery {
  page?: number;
  limit?: number;
  status?: VehicleRegStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  applicationType?: 'new' | 'existing';
}

export interface ListApplicationsResult {
  applications: any[];
  total: number;
  page: number;
  totalPages: number;
}
