import { ProcurementAward } from './procurement-awards.entity';
import { CreateProcurementAwardDTO, UpdateProcurementAwardDTO, ListProcurementAwardQuery } from './procurement-awards.dto';
export interface ListProcurementAwardResult {
    items: ProcurementAward[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementAwardService {
    createAward(dto: CreateProcurementAwardDTO, createdBy?: string): Promise<ProcurementAward>;
    listAwards(query: ListProcurementAwardQuery): Promise<ListProcurementAwardResult>;
    getAwardById(id: string): Promise<ProcurementAward>;
    updateAward(id: string, dto: UpdateProcurementAwardDTO): Promise<ProcurementAward>;
    deleteAward(id: string): Promise<void>;
}
export declare const procurementAwardService: ProcurementAwardService;
export {};
//# sourceMappingURL=procurement-awards.service.d.ts.map