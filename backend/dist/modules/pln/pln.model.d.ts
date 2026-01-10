import mongoose, { Document as MongooseDocument } from 'mongoose';
export type PLNStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED' | 'PAYMENT_PENDING' | 'PAID' | 'PLATES_ORDERED' | 'READY_FOR_COLLECTION' | 'EXPIRED';
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
export interface IPLN extends MongooseDocument {
    referenceId: string;
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
    fullName?: string;
    idNumber?: string;
    phoneNumber?: string;
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
    declarationDate: Date;
    declarationPlace: string;
    declarationRole?: 'applicant' | 'proxy' | 'representative';
    documentUrl: string;
    status: PLNStatus;
    statusHistory: IStatusHistory[];
    adminComments?: string;
    paymentDeadline?: Date;
    paymentReceivedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PLNModel: mongoose.Model<IPLN, {}, {}, {}, mongoose.Document<unknown, {}, IPLN, {}, {}> & IPLN & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=pln.model.d.ts.map