import { Vacancy } from './vacancies.entity';
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
    contactName?: string;
    contactEmail?: string;
    contactTelephone?: string;
    submissionLink?: string;
    submissionEmail?: string;
    submissionInstructions?: string;
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
    vacancies: Vacancy[];
    total: number;
    page: number;
    totalPages: number;
}
declare class VacanciesService {
    createVacancy(dto: CreateVacancyDTO): Promise<Vacancy>;
    listVacancies(query: ListVacanciesQuery): Promise<ListVacanciesResult>;
    getVacancyById(vacancyId: string): Promise<Vacancy>;
    updateVacancy(vacancyId: string, dto: UpdateVacancyDTO): Promise<Vacancy>;
    deleteVacancy(vacancyId: string): Promise<void>;
}
export declare const vacanciesService: VacanciesService;
export {};
//# sourceMappingURL=vacancies.service.d.ts.map