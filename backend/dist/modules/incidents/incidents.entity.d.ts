export declare class Incident {
    id: number;
    title: string;
    type: 'Accident' | 'Road closure' | 'Hazard' | 'Debris' | 'Flooding';
    road: string;
    locationDescription: string;
    area: string | null;
    status: 'Active' | 'Cleared';
    severity: 'Low' | 'Medium' | 'High' | null;
    reportedAt: Date;
    expectedClearance: Date | null;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
    source: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=incidents.entity.d.ts.map