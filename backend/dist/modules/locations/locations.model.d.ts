import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface ILocation extends MongooseDocument {
    name: string;
    address: string;
    region: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    contactNumber?: string;
    email?: string;
    services?: string[];
    operatingHours?: {
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
    };
    closedDays?: string[];
    specialHours?: Array<{
        date: string;
        reason: string;
        closed: boolean;
        hours?: {
            open: string;
            close: string;
        };
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LocationModel: mongoose.Model<ILocation, {}, {}, {}, mongoose.Document<unknown, {}, ILocation, {}, {}> & ILocation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=locations.model.d.ts.map