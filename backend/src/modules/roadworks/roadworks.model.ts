import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type RoadworkStatus = 'Planned' | 'Ongoing' | 'Completed';

export interface IRoadwork extends MongooseDocument {
  title: string;
  road: string;
  section: string;
  area?: string;
  status: RoadworkStatus;
  startDate?: Date;
  endDate?: Date;
  expectedDelayMinutes?: number;
  trafficControl?: string;
  expectedCompletion?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roadworkSchema = new Schema<IRoadwork>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    road: { type: String, required: true, trim: true, maxlength: 50 },
    section: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['Planned', 'Ongoing', 'Completed'],
      default: 'Planned',
      index: true,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    expectedDelayMinutes: { type: Number, min: 0 },
    trafficControl: { type: String, trim: true, maxlength: 200 },
    expectedCompletion: { type: Date },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

roadworkSchema.index({ road: 1, status: 1, startDate: -1 });
roadworkSchema.index({ area: 1, status: 1 });
roadworkSchema.index({ title: 'text', section: 'text', road: 'text', area: 'text' });

export const RoadworkModel = mongoose.model<IRoadwork>('Roadwork', roadworkSchema);

