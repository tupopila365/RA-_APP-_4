import { IVacancy } from './vacancies.model';
export interface CreateVacancyDTO {
    title: string;
    type: 'full-time' | 'part-time' | 'bursary' | 'internship';
    department: string;
    location: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    salary?: string;
    closingDate: Date;
    pdfUrl?: string;
    published?: boolean;
}
export interface UpdateVacancyDTO {
    title?: string;
    type?: 'full-time' | 'part-time' | 'bursary' | 'internship';
    department?: string;
    location?: string;
    description?: string;
    requirements?: string[];
    responsibilities?: string[];
    salary?: string;
    closingDate?: Date;
    pdfUrl?: string;
    published?: boolean;
}
export interface ListVacanciesQuery {
    page?: number;
    limit?: number;
    type?: 'full-time' | 'part-time' | 'bursary' | 'internship';
    department?: string;
    location?: string;
    published?: boolean;
    search?: string;
}
export interface ListVacanciesResult {
    vacancies: IVacancy[];
    total: number;
    page: number;
    totalPages: number;
}
declare class VacanciesService {
    /**
     * Create a new vacancy
     */
    createVacancy(dto: CreateVacancyDTO): Promise<IVacancy>;
    /**
     * List vacancies with pagination, filtering, and search
     */
    listVacancies(query: ListVacanciesQuery): Promise<ListVacanciesResult>;
    /**
     * Get a single vacancy by ID
     */
    getVacancyById(vacancyId: string): Promise<IVacancy>;
    /**
     * Update a vacancy
     */
    updateVacancy(vacancyId: string, dto: UpdateVacancyDTO): Promise<IVacancy>;
    /**
     * Delete a vacancy
     */
    deleteVacancy(vacancyId: string): Promise<void>;
}
export declare const vacanciesService: VacanciesService;
export {};
//# sourceMappingURL=vacancies.service.d.ts.map