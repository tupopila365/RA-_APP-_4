import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

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

const incidentSchema = new Schema<IIncident>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: {
      type: String,
      required: true,
      enum: ['Accident', 'Road closure', 'Hazard', 'Debris', 'Flooding'],
    },
    road: { type: String, required: true, trim: true, maxlength: 50 },
    locationDescription: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['Active', 'Cleared'],
      default: 'Active',
      index: true,
    },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    reportedAt: { type: Date, default: () => new Date(), index: true },
    expectedClearance: { type: Date },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    source: {
      type: String,
      enum: ['official'],
      default: 'official',
    },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({ road: 1, status: 1, reportedAt: -1 });
incidentSchema.index({ area: 1, status: 1, reportedAt: -1 });
incidentSchema.index({ type: 1, status: 1 });
incidentSchema.index({ locationDescription: 'text', road: 'text', area: 'text' });

export const IncidentModel = mongoose.model<IIncident>('Incident', incidentSchema);











