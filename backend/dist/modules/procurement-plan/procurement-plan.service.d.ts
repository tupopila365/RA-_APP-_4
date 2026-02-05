import { ProcurementPlan } from './procurement-plan.entity';
import { CreateProcurementPlanDTO, UpdateProcurementPlanDTO, ListProcurementPlanQuery } from './procurement-plan.dto';
export interface ListProcurementPlanResult {
    items: ProcurementPlan[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementPlanService {
    createPlan(dto: CreateProcurementPlanDTO, createdBy?: string): Promise<ProcurementPlan>;
    listPlans(query: ListProcurementPlanQuery): Promise<ListProcurementPlanResult>;
    getPlanById(id: string): Promise<ProcurementPlan>;
    updatePlan(id: string, dto: UpdateProcurementPlanDTO): Promise<ProcurementPlan>;
    deletePlan(id: string): Promise<void>;
}
export declare const procurementPlanService: ProcurementPlanService;
export {};
//# sourceMappingURL=procurement-plan.service.d.ts.map