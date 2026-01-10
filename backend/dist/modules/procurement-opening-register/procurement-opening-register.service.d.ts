import { IProcurementOpeningRegister } from './procurement-opening-register.model';
import { CreateProcurementOpeningRegisterDTO, UpdateProcurementOpeningRegisterDTO, ListProcurementOpeningRegisterQuery } from './procurement-opening-register.dto';
export interface ListProcurementOpeningRegisterResult {
    items: IProcurementOpeningRegister[];
    total: number;
    page: number;
    totalPages: number;
}
declare class ProcurementOpeningRegisterService {
    /**
     * Create a new procurement opening register item
     */
    createItem(dto: CreateProcurementOpeningRegisterDTO, createdBy?: string): Promise<IProcurementOpeningRegister>;
    /**
     * List procurement opening register items with pagination, filtering, and search
     */
    listItems(query: ListProcurementOpeningRegisterQuery): Promise<ListProcurementOpeningRegisterResult>;
    /**
     * Get a single procurement opening register item by ID
     */
    getItemById(id: string): Promise<IProcurementOpeningRegister>;
    /**
     * Update procurement opening register item
     */
    updateItem(id: string, dto: UpdateProcurementOpeningRegisterDTO): Promise<IProcurementOpeningRegister>;
    /**
     * Delete procurement opening register item
     */
    deleteItem(id: string): Promise<void>;
}
export declare const procurementOpeningRegisterService: ProcurementOpeningRegisterService;
export {};
//# sourceMappingURL=procurement-opening-register.service.d.ts.map