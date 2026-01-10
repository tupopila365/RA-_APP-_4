import mongoose, { Document as MongooseDocument } from 'mongoose';
export type IncidentStatus = 'Active' | 'Cleared';
export type IncidentType = 'Accident' | 'Road closure' | 'Hazard' | 'Debris' | 'Flooding';
export type IncidentSeverity = 'Low' | 'Medium' | 'High';
export interface IIncident extends MongooseDocument {
    title: string;
    type: IncidentType;
    road: string;
    locationDescription: string;
    area?: string;
    status: IncidentStatus;
    severity?: IncidentSeverity;
    reportedAt: Date;
    expectedClearance?: Date;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    source: 'official';
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const IncidentModel: mongoose.Model<IIncident, {}, {}, {}, mongoose.Document<unknown, {}, IIncident, {}, {}> & IIncident & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=incidents.model.d.ts.map