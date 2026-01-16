import mongoose, { Document as MongooseDocument } from 'mongoose';
export type Severity = 'low' | 'medium' | 'high';
export type ReportStatus = 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';
export interface IPotholeReport extends MongooseDocument {
    deviceId: string;
    referenceCode: string;
    location: {
        latitude: number;
        longitude: number;
    };
    town: string;
    region: string;
    roadName: string;
    photoUrl: string;
    severity?: Severity;
    description?: string;
    status: ReportStatus;
    assignedTo?: string;
    adminNotes?: string;
    repairPhotoUrl?: string;
    fixedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PotholeReportModel: mongoose.Model<IPotholeReport, {}, {}, {}, mongoose.Document<unknown, {}, IPotholeReport, {}, {}> & IPotholeReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=pothole-reports.model.d.ts.map