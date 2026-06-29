export type VerificationResult =
  | 'valid'
  | 'expired'
  | 'suspended'
  | 'revoked'
  | 'not_found'
  | 'token_expired'
  | 'token_used'
  | 'invalid';

export type VerificationMethod = 'qr_scan' | 'manual_lookup';

export type OfficerStatus = 'active' | 'suspended' | 'inactive';

export type IncidentSeverity = 'low' | 'medium' | 'high';

export type IncidentStatus = 'open' | 'investigating' | 'closed';

export interface Organisation {
  id: string;
  name: string;
  code: string;
}

export interface Unit {
  id: string;
  organisationId: string;
  name: string;
}

export interface Officer {
  id: string;
  officerId: string;
  name: string;
  organisation: string;
  unit: string;
  role: string;
  status: OfficerStatus;
  email: string;
  lastActive: string;
  scans7d: number;
  createdAt: string;
}

export interface LicenceRecord {
  licenceNumber: string;
  displayNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  codes: string[];
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  restrictions: string[];
}

export interface VerificationAudit {
  id: string;
  scanId: string;
  verifiedAt: string;
  officerId: string;
  officerName: string;
  organisation: string;
  method: VerificationMethod;
  result: VerificationResult;
  licenceNumber: string;
  holderName: string;
  durationMs: number;
  tokenId?: string;
  registrySnapshot?: LicenceRecord;
}

export interface Incident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  officerId: string;
  officerName: string;
  linkedScanIds: string[];
  createdAt: string;
  assignee?: string;
}

export interface CommandCenterStats {
  scansPerHour: number;
  validRate: number;
  expiredQrCount: number;
  openIncidents: number;
  activeOfficers: number;
}

export interface SystemSettings {
  qrTokenTtlSeconds: number;
  qrTokenSingleUse: boolean;
  maxTokensPerDriverPerHour: number;
  manualLookupEnabled: boolean;
  verifierMinAppVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface ConsoleUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'ops_manager' | 'auditor' | 'help_desk';
  organisation?: string;
}
