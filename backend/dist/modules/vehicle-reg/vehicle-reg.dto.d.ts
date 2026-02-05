import { VehicleRegStatus, IdType, PersonType, DrivenType, FuelType, TransmissionType, MainColour, OwnershipType, IAddress, IPhoneNumber } from './vehicle-reg.model';
export interface CreateVehicleRegDTO {
    idType: IdType;
    identificationNumber: string;
    personType?: PersonType;
    surname?: string;
    initials?: string;
    businessName?: string;
    postalAddress: IAddress;
    streetAddress: IAddress;
    telephoneDay?: IPhoneNumber;
    hasProxy?: boolean;
    proxyIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
    proxyIdNumber?: string;
    proxySurname?: string;
    proxyInitials?: string;
    hasRepresentative?: boolean;
    representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
    representativeIdNumber?: string;
    representativeSurname?: string;
    representativeInitials?: string;
    declarationAccepted: boolean;
    declarationPlace: string;
    declarationRole?: 'owner' | 'proxy' | 'representative';
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
    paymentAmount: number;
    paymentMethod?: string;
    paymentReference: string;
    applicationType: 'new' | 'existing';
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
//# sourceMappingURL=vehicle-reg.dto.d.ts.map