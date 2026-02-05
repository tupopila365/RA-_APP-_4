export declare class PLN {
    id: number;
    referenceId: string;
    trackingPin: string;
    transactionType: string;
    idType: string;
    trafficRegisterNumber: string | null;
    businessRegNumber: string | null;
    surname: string;
    initials: string;
    businessName: string | null;
    postalAddress: {
        line1: string;
        line2?: string;
        line3?: string;
    };
    streetAddress: {
        line1: string;
        line2?: string;
        line3?: string;
    };
    telephoneHome: {
        code: string;
        number: string;
    } | null;
    telephoneDay: {
        code: string;
        number: string;
    } | null;
    cellNumber: {
        code: string;
        number: string;
    } | null;
    email: string | null;
    trafficRegisterNumber_encrypted: string | null;
    businessRegNumber_encrypted: string | null;
    surname_encrypted: string;
    initials_encrypted: string;
    businessName_encrypted: string | null;
    email_encrypted: string | null;
    trafficRegisterNumber_hash: string | null;
    businessRegNumber_hash: string | null;
    surname_hash: string;
    email_hash: string | null;
    fullName: string | null;
    idNumber: string | null;
    phoneNumber: string | null;
    fullName_encrypted: string | null;
    idNumber_encrypted: string | null;
    phoneNumber_encrypted: string | null;
    fullName_hash: string | null;
    idNumber_hash: string | null;
    plateFormat: string;
    quantity: 1 | 2;
    plateChoices: Array<{
        text: string;
        meaning: string;
    }>;
    hasRepresentative: boolean;
    representativeIdType: string | null;
    representativeIdNumber: string | null;
    representativeSurname: string | null;
    representativeInitials: string | null;
    hasVehicle: boolean;
    currentLicenceNumber: string | null;
    vehicleRegisterNumber: string | null;
    chassisNumber: string | null;
    vehicleMake: string | null;
    seriesName: string | null;
    declarationAccepted: boolean;
    declarationDate: Date;
    declarationPlace: string;
    declarationRole: string | null;
    documentUrl: string;
    status: string;
    statusHistory: Array<{
        status: string;
        changedBy: string;
        timestamp: Date;
        comment?: string;
    }>;
    adminComments: string | null;
    paymentDeadline: Date | null;
    paymentReceivedAt: Date | null;
    assignedTo: string | null;
    priority: string;
    tags: string[] | null;
    internalNotes: string | null;
    paymentAmount: number | null;
    paymentMethod: string | null;
    paymentReference: string | null;
    processedBy: string | null;
    processedAt: Date | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    plateOrderNumber: string | null;
    plateSupplier: string | null;
    plateOrderedAt: Date | null;
    plateDeliveredAt: Date | null;
    plateCollectedAt: Date | null;
    plateCollectedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=pln.entity.d.ts.map