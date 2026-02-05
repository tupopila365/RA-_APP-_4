export type IncidentStatus = 'Active' | 'Cleared';
export type IncidentType = 'Accident' | 'Road closure' | 'Hazard' | 'Debris' | 'Flooding';
export type IncidentSeverity = 'Low' | 'Medium' | 'High';

export interface IIncident {
  title: string;
  type: IncidentType;
  road: string;
  locationDescription: string;
  area?: string;
  status: IncidentStatus;
  severity?: IncidentSeverity;
  reportedAt: Date;
  expectedClearance?: Date;
  coordinates?: { latitude: number; longitude: number };
  source: 'official';
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
