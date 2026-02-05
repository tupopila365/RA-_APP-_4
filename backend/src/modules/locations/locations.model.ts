export interface ILocation {
  name: string;
  address: string;
  region: string;
  coordinates: { latitude: number; longitude: number };
  contactNumber?: string;
  email?: string;
  services?: string[];
  operatingHours?: {
    weekdays?: { open: string; close: string };
    weekends?: { open: string; close: string };
    publicHolidays?: { open: string; close: string };
  };
  closedDays?: string[];
  specialHours?: Array<{
    date: string;
    reason: string;
    closed: boolean;
    hours?: { open: string; close: string };
  }>;
  createdAt: Date;
  updatedAt: Date;
}
