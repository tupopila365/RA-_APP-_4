import { IPLN, PLNStatus } from './pln.model';
import { CreateApplicationDTO, ListApplicationsQuery, ListApplicationsResult } from './pln.dto';
declare class PLNService {
    /**
     * Generate unique reference ID using secure random generation
     * Format: PLN-{YYYY}-{SecureRandom12}
     */
    generateReferenceId(): string;
    /**
     * Generate tracking PIN (simple for now - everyone gets 12345)
     */
    generateTrackingPin(): string;
    /**
     * Create a new PLN application
     */
    createApplication(dto: CreateApplicationDTO, file: Express.Multer.File): Promise<IPLN>;
    /**
     * Get application by reference ID and PIN (public tracking)
     * Universal PIN: 12345 for all users
     */
    getApplicationByReference(referenceId: string, pin: string): Promise<IPLN>;
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
        recentApplications: IPLN[];
        paymentOverdue: number;
        monthlyStats: {
            month: string;
            count: number;
        }[];
    }>;
    /**
     * Update admin comments
     */
    updateAdminComments(id: string, comments: string, adminId: string): Promise<IPLN>;
    /**
     * Assign application to admin
     */
    assignToAdmin(id: string, assignedTo: string, adminId: string): Promise<IPLN>;
    /**
     * Set application priority
     */
    setPriority(id: string, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT', adminId: string): Promise<IPLN>;
}
export declare const plnService: PLNService;
export {};
//# sourceMappingURL=pln.service.d.ts.map