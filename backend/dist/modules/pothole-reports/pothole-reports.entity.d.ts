export declare class PotholeReport {
    id: number;
    deviceId: string;
    userEmail: string | null;
    referenceCode: string;
    location: {
        latitude: number;
        longitude: number;
    };
    town: string;
    region: string;
    roadName: string;
    photoUrl: string;
    severity: 'low' | 'medium' | 'high' | null;
    description: string | null;
    status: 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';
    assignedTo: string | null;
    adminNotes: string | null;
    repairPhotoUrl: string | null;
    fixedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=pothole-reports.entity.d.ts.map