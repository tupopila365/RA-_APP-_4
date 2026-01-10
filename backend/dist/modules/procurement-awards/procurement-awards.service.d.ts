import { IProcurementAward } from './procurement-awards.model';
import { CreateProcurementAwardDTO, UpdateProcurementAwardDTO, ListProcurementAwardQuery } from './procurement-awards.dto';
export interface ListProcurementAwardResult {
    items: IProcurementAward[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementAwardService {
    /**
     * Create a new procurement award
     */
    createAward(dto: CreateProcurementAwardDTO, createdBy?: string): Promise<IProcurementAward>;
    /**
     * List procurement awards with pagination, filtering, and search
     */
    listAwards(query: ListProcurementAwardQuery): Promise<ListProcurementAwardResult>;
    /**
     * Get a single procurement award by ID
     */
    getAwardById(id: string): Promise<IProcurementAward>;
    /**
     * Update procurement award
     */
    updateAward(id: string, dto: UpdateProcurementAwardDTO): Promise<IProcurementAward>;
    /**
     * Delete procurement award
     */
    deleteAward(id: string): Promise<void>;
}
export declare const procurementAwardService: ProcurementAwardService;
export {};
//# sourceMappingURL=procurement-awards.service.d.ts.map