import apiClient from './api';

export type IncidentStatus = 'Active' | 'Cleared';
export type IncidentType = 'Accident' | 'Road closure' | 'Hazard' | 'Debris' | 'Flooding';
export type IncidentSeverity = 'Low' | 'Medium' | 'High';

export interface Incident {
  _id?: string;
  id?: string;
  title: string;
  type: IncidentType;
  road: string;
  locationDescription: string;
  area?: string;
  status: IncidentStatus;
  severity?: IncidentSeverity;
  reportedAt?: string;
  expectedClearance?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ListIncidentsParams {
  status?: IncidentStatus;
  road?: string;
  area?: string;
  type?: IncidentType;
}

export interface IncidentPayload {
  title: string;
  type: IncidentType;
  road: string;
  locationDescription: string;
  area?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  reportedAt?: string;
  expectedClearance?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const buildQuery = (params: ListIncidentsParams = {}) => {
  const qp = new URLSearchParams();
  if (params.status) qp.append('status', params.status);
  if (params.road) qp.append('road', params.road);
  if (params.area) qp.append('area', params.area);
  if (params.type) qp.append('type', params.type);
  const str = qp.toString();
  return str ? `?${str}` : '';
};

export const listIncidents = async (params: ListIncidentsParams = {}): Promise<Incident[]> => {
  const response = await apiClient.get(`/incidents${buildQuery(params)}`);
  return response.data.data || [];
};

export const getIncidentById = async (id: string): Promise<Incident> => {
  const response = await apiClient.get(`/incidents/${id}`);
  return response.data.data;
};

export const createIncident = async (payload: IncidentPayload): Promise<Incident> => {
  const response = await apiClient.post('/incidents', payload);
  return response.data.data;
};

export const updateIncident = async (id: string, payload: IncidentPayload): Promise<Incident> => {
  const response = await apiClient.put(`/incidents/${id}`, payload);
  return response.data.data;
};

export const deleteIncident = async (id: string): Promise<void> => {
  await apiClient.delete(`/incidents/${id}`);
};






