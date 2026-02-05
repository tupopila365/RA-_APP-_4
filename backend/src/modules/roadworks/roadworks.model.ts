export type RoadworkStatus = 'Open' | 'Ongoing' | 'Ongoing Maintenance' | 'Planned' | 'Planned Works' | 'Closed' | 'Restricted' | 'Completed';

export interface IWaypoint {
  name: string;
  coordinates: { latitude: number; longitude: number };
}

export interface IAlternateRoute {
  routeName: string;
  roadsUsed: string[];
  waypoints: IWaypoint[];
  vehicleType: string[];
  distanceKm: number;
  estimatedTime: string;
  polylineCoordinates: Array<{ latitude: number; longitude: number }>;
  isRecommended: boolean;
  approved: boolean;
}

export interface IRoadClosure {
  roadCode: string;
  startTown?: string;
  endTown?: string;
  startCoordinates: { latitude: number; longitude: number };
  endCoordinates: { latitude: number; longitude: number };
  polylineCoordinates: Array<{ latitude: number; longitude: number }>;
}

export interface IChangeHistoryEntry {
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: 'created' | 'updated' | 'published' | 'unpublished' | 'status_changed';
  changes: { field: string; oldValue?: unknown; newValue?: unknown }[];
  comment?: string;
}

export interface IRoadwork {
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
  alternativeRoute?: string;
  coordinates?: { latitude: number; longitude: number };
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
  roadClosure?: IRoadClosure;
  alternateRoutes: IAlternateRoute[];
  changeHistory: IChangeHistoryEntry[];
}
