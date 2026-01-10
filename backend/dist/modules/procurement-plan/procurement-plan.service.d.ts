import { IProcurementPlan } from './procurement-plan.model';
import { CreateProcurementPlanDTO, UpdateProcurementPlanDTO, ListProcurementPlanQuery } from './procurement-plan.dto';
export interface ListProcurementPlanResult {
    items: IProcurementPlan[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementPlanService {
    /**
     * Create a new procurement plan
     */
    createPlan(dto: CreateProcurementPlanDTO, createdBy?: string): Promise<IProcurementPlan>;
    /**
     * List procurement plans with pagination, filtering, and search
     */
    listPlans(query: ListProcurementPlanQuery): Promise<ListProcurementPlanResult>;
    /**
     * Get a single procurement plan by ID
     */
    getPlanById(id: string): Promise<IProcurementPlan>;
    /**
     * Update procurement plan
     */
    updatePlan(id: string, dto: UpdateProcurementPlanDTO): Promise<IProcurementPlan>;
    /**
     * Delete procurement plan
     */
    deletePlan(id: string): Promise<void>;
}
export declare const procurementPlanService: ProcurementPlanService;
export {};
//# sourceMappingURL=procurement-plan.service.d.ts.map