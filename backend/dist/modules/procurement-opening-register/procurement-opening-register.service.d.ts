import { ProcurementOpeningRegister } from './procurement-opening-register.entity';
import { CreateProcurementOpeningRegisterDTO, UpdateProcurementOpeningRegisterDTO, ListProcurementOpeningRegisterQuery } from './procurement-opening-register.dto';
export interface ListProcurementOpeningRegisterResult {
    items: ProcurementOpeningRegister[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementOpeningRegisterService {
    createItem(dto: CreateProcurementOpeningRegisterDTO, createdBy?: string): Promise<ProcurementOpeningRegister>;
    listItems(query: ListProcurementOpeningRegisterQuery): Promise<ListProcurementOpeningRegisterResult>;
    getItemById(id: string): Promise<ProcurementOpeningRegister>;
    updateItem(id: string, dto: UpdateProcurementOpeningRegisterDTO): Promise<ProcurementOpeningRegister>;
    deleteItem(id: string): Promise<void>;
}
export declare const procurementOpeningRegisterService: ProcurementOpeningRegisterService;
export {};
//# sourceMappingURL=procurement-opening-register.service.d.ts.map