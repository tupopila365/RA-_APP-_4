import { PLNStatus, IPlateChoice, IdType, PlateFormat, IAddress, IPhoneNumber } from './pln.model';
export interface CreateApplicationDTO {
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
    plateFormat: PlateFormat;
    quantity: 1 | 2;
    plateChoices: IPlateChoice[];
    hasRepresentative?: boolean;
    representativeIdType?: 'Traffic Register Number' | 'Namibia ID-doc';
    representativeIdNumber?: string;
    representativeSurname?: string;
    representativeInitials?: string;
    currentLicenceNumber?: string;
    vehicleRegisterNumber?: string;
    chassisNumber?: string;
    vehicleMake?: string;
    seriesName?: string;
    declarationAccepted: boolean;
    declarationPlace: string;
    declarationRole?: 'applicant' | 'proxy' | 'representative';
    fullName?: string;
    idNumber?: string;
    phoneNumber?: string;
}
export interface UpdateStatusDTO {
    status: PLNStatus;
    comment?: string;
}
export interface ListApplicationsQuery {
    page?: number;
    limit?: number;
    status?: PLNStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}
export interface ListApplicationsResult {
    applications: any[];
    total: number;
    page: number;
    totalPages: number;
}
//# sourceMappingURL=pln.dto.d.ts.map