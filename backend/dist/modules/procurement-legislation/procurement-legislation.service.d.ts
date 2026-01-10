import { IProcurementLegislation } from './procurement-legislation.model';
import { CreateProcurementLegislationDTO, UpdateProcurementLegislationDTO, ListProcurementLegislationQuery } from './procurement-legislation.dto';
export interface ListProcurementLegislationResult {
    items: IProcurementLegislation[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementLegislationService {
    /**
     * Create a new procurement legislation document
     */
    createLegislation(dto: CreateProcurementLegislationDTO, createdBy?: string): Promise<IProcurementLegislation>;
    /**
     * List procurement legislation with pagination, filtering, and search
     */
    listLegislation(query: ListProcurementLegislationQuery): Promise<ListProcurementLegislationResult>;
    /**
     * Get a single procurement legislation by ID
     */
    getLegislationById(id: string): Promise<IProcurementLegislation>;
    /**
     * Update procurement legislation
     */
    updateLegislation(id: string, dto: UpdateProcurementLegislationDTO): Promise<IProcurementLegislation>;
    /**
     * Delete procurement legislation
     */
    deleteLegislation(id: string): Promise<void>;
}
export declare const procurementLegislationService: ProcurementLegislationService;
export {};
//# sourceMappingURL=procurement-legislation.service.d.ts.map