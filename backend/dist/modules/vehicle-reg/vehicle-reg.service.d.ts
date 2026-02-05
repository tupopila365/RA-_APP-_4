import { VehicleReg } from './vehicle-reg.entity';
import { CreateVehicleRegDTO, ListApplicationsQuery, ListApplicationsResult } from './vehicle-reg.dto';
import { VehicleRegStatus } from './vehicle-reg.model';
declare class VehicleRegService {
    /**
     * Generate unique reference ID using secure random generation
     * Format: VREG-{YYYY}-{SecureRandom12}
     */
    generateReferenceId(): string;
    /**
     * Generate tracking PIN (simple for now - everyone gets 12345)
     */
    generateTrackingPin(): string;
    /**
     * Create a new vehicle registration application
     */
    createApplication(dto: CreateVehicleRegDTO, file: Express.Multer.File): Promise<VehicleReg>;
    /**
     * Get application by reference ID and PIN (public tracking)
     */
    getApplicationByReference(referenceId: string, pin: string): Promise<VehicleReg>;
    /**
     * Get applications by user email
     */
    getApplicationsByEmail(userEmail: string): Promise<VehicleReg[]>;
    /**
     * Get application by ID (admin)
     */
    getApplicationById(id: string): Promise<VehicleReg>;
    /**
     * List applications with pagination and filtering (admin)
     */
    listApplications(query: ListApplicationsQuery): Promise<ListApplicationsResult>;
    /**
     * Update application status with history logging
     */
    updateStatus(id: string, status: VehicleRegStatus, adminId: string, comment?: string): Promise<VehicleReg>;
    /**
     * Mark payment as received
     */
    markPaymentReceived(id: string, adminId: string): Promise<VehicleReg>;
    /**
     * Mark as registered
     */
    markRegistered(id: string, adminId: string, registrationNumber?: string): Promise<VehicleReg>;
    /**
     * Get dashboard statistics
     */
    getDashboardStats(): Promise<{
        total: number;
        byStatus: Record<VehicleRegStatus, number>;
        recentApplications: VehicleReg[];
        paymentOverdue: number;
        monthlyStats: {
            month: string;
            count: number;
        }[];
    }>;
    /**
     * Update admin comments
     */
    updateAdminComments(id: string, comments: string, adminId: string): Promise<VehicleReg>;
    /**
     * Assign application to admin
     */
    assignToAdmin(id: string, adminName: string): Promise<VehicleReg>;
    /**
     * Set application priority
     */
    setPriority(id: string, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'): Promise<VehicleReg>;
}
export declare const vehicleRegService: VehicleRegService;
export {};
//# sourceMappingURL=vehicle-reg.service.d.ts.map