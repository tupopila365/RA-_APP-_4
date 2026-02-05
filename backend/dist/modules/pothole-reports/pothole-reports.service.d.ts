import { PotholeReport } from './pothole-reports.entity';
import type { Severity, ReportStatus } from './pothole-reports.model';
export interface CreateReportDTO {
    deviceId: string;
    userEmail?: string;
    location: {
        latitude: number;
        longitude: number;
    };
    roadName?: string;
    townName?: string;
    streetName?: string;
    description?: string;
}
export interface ListReportsQuery {
    page?: number;
    limit?: number;
    deviceId?: string;
    region?: string;
    town?: string;
    severity?: Severity;
    status?: ReportStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}
export interface ListReportsResult {
    reports: PotholeReport[];
    total: number;
    page: number;
    totalPages: number;
}
declare class PotholeReportsService {
    generateReferenceCode(): string;
    createReport(dto: CreateReportDTO, photoFile: Express.Multer.File): Promise<PotholeReport>;
    getReportsByDeviceId(deviceId: string, filters?: {
        status?: ReportStatus;
    }): Promise<PotholeReport[]>;
    getReportsByUserEmail(userEmail: string, filters?: {
        status?: ReportStatus;
    }): Promise<PotholeReport[]>;
    getReportById(reportId: string): Promise<PotholeReport>;
    listReports(query: ListReportsQuery): Promise<ListReportsResult>;
    updateReportStatus(reportId: string, status: ReportStatus, updates?: {
        assignedTo?: string;
        adminNotes?: string;
        severity?: Severity;
    }): Promise<PotholeReport>;
    assignReport(reportId: string, assignedTo: string): Promise<PotholeReport>;
    addAdminNotes(reportId: string, adminNotes: string): Promise<PotholeReport>;
    markAsFixed(reportId: string, repairPhotoFile?: Express.Multer.File): Promise<PotholeReport>;
    deleteReport(reportId: string): Promise<void>;
    getRegionsAndTowns(): Promise<{
        regions: string[];
        towns: string[];
    }>;
}
export declare const potholeReportsService: PotholeReportsService;
export {};
//# sourceMappingURL=pothole-reports.service.d.ts.map