export declare class Location {
    id: number;
    name: string;
    address: string;
    region: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    contactNumber: string | null;
    email: string | null;
    services: string[] | null;
    operatingHours: {
        weekdays?: {
            open: string;
            close: string;
        };
        weekends?: {
            open: string;
            close: string;
        };
        publicHolidays?: {
            open: string;
            close: string;
        };
    } | null;
    closedDays: string[] | null;
    specialHours: Array<{
        date: string;
        reason: string;
        closed: boolean;
        hours?: {
            open: string;
            close: string;
        };
    }> | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=locations.entity.d.ts.map