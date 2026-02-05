export declare class Roadwork {
    id: number;
    title: string;
    road: string;
    section: string;
    area: string | null;
    region: string;
    status: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    expectedCompletion: Date | null;
    completedAt: Date | null;
    alternativeRoute: string | null;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
    affectedLanes: string | null;
    contractor: string | null;
    estimatedDuration: string | null;
    expectedDelayMinutes: number | null;
    trafficControl: string | null;
    published: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical' | null;
    createdBy: string | null;
    createdByEmail: string | null;
    updatedBy: string | null;
    updatedByEmail: string | null;
    roadClosure: Record<string, unknown> | null;
    alternateRoutes: unknown[];
    changeHistory: unknown[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=roadworks.entity.d.ts.map