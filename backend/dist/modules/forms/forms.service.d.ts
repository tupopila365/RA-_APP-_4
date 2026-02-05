import { Form } from './forms.entity';
export declare class FormService {
    createForm(data: {
        name: string;
        category: string;
        documents: Array<{
            title: string;
            url: string;
            fileName: string;
        }>;
        published?: boolean;
    }, userId?: string): Promise<Form>;
    listForms(options: {
        page?: number;
        limit?: number;
        category?: string;
        published?: boolean;
        search?: string;
    }): Promise<{
        items: Form[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFormById(id: string): Promise<Form>;
    updateForm(id: string, data: Partial<Form>): Promise<Form>;
    deleteForm(id: string): Promise<void>;
}
export declare const formService: FormService;
//# sourceMappingURL=forms.service.d.ts.map