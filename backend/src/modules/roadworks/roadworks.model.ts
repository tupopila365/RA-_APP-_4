import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type RoadworkStatus = 'Open' | 'Ongoing' | 'Ongoing Maintenance' | 'Planned' | 'Planned Works' | 'Closed' | 'Restricted' | 'Completed';

export interface IWaypoint {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface IAlternateRoute {
  routeName: string;
  roadsUsed: string[];
  waypoints: IWaypoint[];
  vehicleType: string[];
  distanceKm: number;
  estimatedTime: string;
  polylineCoordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  isRecommended: boolean;
  approved: boolean;
}

export interface IRoadClosure {
  roadCode: string;
  startTown?: string;
  endTown?: string;
  startCoordinates: {
    latitude: number;
    longitude: number;
  };
  endCoordinates: {
    latitude: number;
    longitude: number;
  };
  polylineCoordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export interface IChangeHistoryEntry {
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: 'created' | 'updated' | 'published' | 'unpublished' | 'status_changed';
  changes: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  comment?: string;
}

export interface IRoadwork extends MongooseDocument {
  title: string;
  road: string;
  section: string;
  area?: string;
  region: string;
  status: RoadworkStatus;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  expectedCompletion?: Date;
  completedAt?: Date;
  alternativeRoute?: string; // Legacy field - kept for backward compatibility
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  affectedLanes?: string;
  contractor?: string;
  estimatedDuration?: string;
  expectedDelayMinutes?: number;
  trafficControl?: string;
  published: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdBy?: string;
  createdByEmail?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  // New structured alternate routes fields
  roadClosure?: IRoadClosure;
  alternateRoutes: IAlternateRoute[];
  // Versioning and audit trail
  changeHistory: IChangeHistoryEntry[];
}

const waypointSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  coordinates: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
});

const alternateRouteSchema = new Schema({
  routeName: { type: String, required: true, trim: true, maxlength: 100 },
  roadsUsed: [{ type: String, trim: true, maxlength: 50 }],
  waypoints: [waypointSchema],
  vehicleType: [{ type: String, enum: ['All', 'Light Vehicles', 'Heavy Vehicles', 'Motorcycles', 'Buses', 'Trucks'], default: ['All'] }],
  distanceKm: { type: Number, required: true, min: 0 },
  estimatedTime: { type: String, required: true, trim: true, maxlength: 20 },
  polylineCoordinates: [{
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  }],
  isRecommended: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
});

const roadClosureSchema = new Schema({
  roadCode: { type: String, required: true, trim: true, maxlength: 20 },
  startTown: { type: String, trim: true, maxlength: 100 },
  endTown: { type: String, trim: true, maxlength: 100 },
  startCoordinates: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  endCoordinates: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  polylineCoordinates: [{
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  }],
});

const changeHistorySchema = new Schema({
  timestamp: { type: Date, required: true, default: Date.now },
  userId: { type: String, required: true, trim: true },
  userEmail: { type: String, trim: true },
  action: { 
    type: String, 
    required: true,
    enum: ['created', 'updated', 'published', 'unpublished', 'status_changed']
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  comment: { type: String, trim: true, maxlength: 500 }
});

const roadworkSchema = new Schema<IRoadwork>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    road: { type: String, required: true, trim: true, maxlength: 50 },
    section: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, trim: true, maxlength: 120 },
    region: { type: String, required: true, trim: true, maxlength: 50 },
    status: {
      type: String,
      enum: ['Open', 'Ongoing', 'Ongoing Maintenance', 'Planned', 'Planned Works', 'Closed', 'Restricted', 'Completed'],
      default: 'Planned',
      index: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    startDate: { type: Date },
    endDate: { type: Date },
    expectedCompletion: { type: Date },
    completedAt: { type: Date },
    alternativeRoute: { type: String, trim: true, maxlength: 500 }, // Legacy field
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    affectedLanes: { type: String, trim: true, maxlength: 100 },
    contractor: { type: String, trim: true, maxlength: 200 },
    estimatedDuration: { type: String, trim: true, maxlength: 100 },
    expectedDelayMinutes: { type: Number, min: 0 },
    trafficControl: { type: String, trim: true, maxlength: 200 },
    published: { type: Boolean, default: false, index: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    createdBy: { type: String, trim: true },
    createdByEmail: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
    updatedByEmail: { type: String, trim: true },
    // New structured alternate routes fields
    roadClosure: roadClosureSchema,
    alternateRoutes: [alternateRouteSchema],
    // Versioning and audit trail
    changeHistory: { type: [changeHistorySchema], default: [] }
  },
  {
    timestamps: true,
  }
);

roadworkSchema.index({ road: 1, status: 1, startDate: -1 });
roadworkSchema.index({ area: 1, status: 1 });
roadworkSchema.index({ region: 1, status: 1 });
roadworkSchema.index({ published: 1, status: 1 });
roadworkSchema.index({ priority: 1, status: 1 });
roadworkSchema.index({ title: 'text', section: 'text', road: 'text', area: 'text', description: 'text' });

export const RoadworkModel = mongoose.model<IRoadwork>('Roadwork', roadworkSchema);


















