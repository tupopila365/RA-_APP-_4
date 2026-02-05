export type Severity = 'low' | 'medium' | 'high';
export type ReportStatus = 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';
export interface IPotholeReport {
    deviceId: string;
    userEmail?: string;
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
//# sourceMappingURL=pothole-reports.model.d.ts.map