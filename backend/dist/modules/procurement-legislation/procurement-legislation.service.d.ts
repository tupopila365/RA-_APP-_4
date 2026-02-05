import { ProcurementLegislation } from './procurement-legislation.entity';
import { CreateProcurementLegislationDTO, UpdateProcurementLegislationDTO, ListProcurementLegislationQuery } from './procurement-legislation.dto';
export interface ListProcurementLegislationResult {
    items: ProcurementLegislation[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementLegislationService {
    createLegislation(dto: CreateProcurementLegislationDTO, createdBy?: string): Promise<ProcurementLegislation>;
    listLegislation(query: ListProcurementLegislationQuery): Promise<ListProcurementLegislationResult>;
    getLegislationById(id: string): Promise<ProcurementLegislation>;
    updateLegislation(id: string, dto: UpdateProcurementLegislationDTO): Promise<ProcurementLegislation>;
    deleteLegislation(id: string): Promise<void>;
}
export declare const procurementLegislationService: ProcurementLegislationService;
export {};
//# sourceMappingURL=procurement-legislation.service.d.ts.map