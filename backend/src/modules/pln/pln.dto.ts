import { PLNStatus, IPlateChoice } from './pln.model';

export interface CreateApplicationDTO {
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  plateChoices: IPlateChoice[];
}

export interface UpdateStatusDTO {
  status: PLNStatus;
  comment?: string;
}

export interface ListApplicationsQuery {
  page?: number;
  limit?: number;
  status?: PLNStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListApplicationsResult {
  applications: any[];
  total: number;
  page: number;
  totalPages: number;
}


