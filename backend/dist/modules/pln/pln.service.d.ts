import { IPLN, PLNStatus } from './pln.model';
import { CreateApplicationDTO, ListApplicationsQuery, ListApplicationsResult } from './pln.dto';
declare class PLNService {
    /**
     * Generate unique reference ID
     * Format: PLN{YYYYMMDD}{6digitRandom}
     */
    generateReferenceId(): string;
    /**
     * Create a new PLN application
     */
    createApplication(dto: CreateApplicationDTO, file: Express.Multer.File): Promise<IPLN>;
    /**
     * Get application by reference ID and ID number (public tracking)
     */
    getApplicationByReference(referenceId: string, idNumber: string): Promise<IPLN>;
    /**
     * Get application by ID (admin)
     */
    getApplicationById(id: string): Promise<IPLN>;
    /**
     * List applications with pagination and filtering (admin)
     */
    listApplications(query: ListApplicationsQuery): Promise<ListApplicationsResult>;
    /**
     * Update application status with history logging
     */
    updateStatus(id: string, status: PLNStatus, adminId: string, comment?: string): Promise<IPLN>;
    /**
     * Mark payment as received
     */
    markPaymentReceived(id: string, adminId: string): Promise<IPLN>;
    /**
     * Order plates (update status to PLATES_ORDERED)
     */
    orderPlates(id: string, adminId: string): Promise<IPLN>;
    /**
     * Mark ready for collection
     */
    markReadyForCollection(id: string, adminId: string): Promise<IPLN>;
    /**
     * Get dashboard statistics
     */
    getDashboardStats(): Promise<{
        total: number;
        byStatus: Record<PLNStatus, number>;
    }>;
}
export declare const plnService: PLNService;
export {};
//# sourceMappingURL=pln.service.d.ts.map