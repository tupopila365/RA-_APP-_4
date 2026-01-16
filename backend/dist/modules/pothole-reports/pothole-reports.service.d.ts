import { IPotholeReport, Severity, ReportStatus } from './pothole-reports.model';
export interface CreateReportDTO {
    deviceId: string;
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
    reports: IPotholeReport[];
    total: number;
    page: number;
    totalPages: number;
}
declare class PotholeReportsService {
    /**
     * Generate unique reference code
     * Format: RA-PT-{YYYYMMDD}-{6digitRandom}
     */
    generateReferenceCode(): string;
    /**
     * Create a new pothole report
     */
    createReport(dto: CreateReportDTO, photoFile: Express.Multer.File): Promise<IPotholeReport>;
    /**
     * Get reports by device ID
     */
    getReportsByDeviceId(deviceId: string, filters?: {
        status?: ReportStatus;
    }): Promise<IPotholeReport[]>;
    /**
     * Get a single report by ID
     */
    getReportById(reportId: string): Promise<IPotholeReport>;
    /**
     * List reports with pagination and filtering (admin)
     */
    listReports(query: ListReportsQuery): Promise<ListReportsResult>;
    /**
     * Update report status (admin-only)
     */
    updateReportStatus(reportId: string, status: ReportStatus, updates?: {
        assignedTo?: string;
        adminNotes?: string;
        severity?: Severity;
    }): Promise<IPotholeReport>;
    /**
     * Assign report to maintenance team
     */
    assignReport(reportId: string, assignedTo: string): Promise<IPotholeReport>;
    /**
     * Add admin notes to report
     */
    addAdminNotes(reportId: string, adminNotes: string): Promise<IPotholeReport>;
    /**
     * Mark report as fixed
     */
    markAsFixed(reportId: string, repairPhotoFile?: Express.Multer.File): Promise<IPotholeReport>;
    /**
     * Delete a report
     */
    deleteReport(reportId: string): Promise<void>;
    /**
     * Get unique regions and towns for filtering
     */
    getRegionsAndTowns(): Promise<{
        regions: string[];
        towns: string[];
    }>;
}
export declare const potholeReportsService: PotholeReportsService;
export {};
//# sourceMappingURL=pothole-reports.service.d.ts.map