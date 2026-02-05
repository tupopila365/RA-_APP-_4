export declare class Vacancy {
    id: number;
    title: string;
    type: 'full-time' | 'part-time' | 'bursary' | 'internship';
    department: string;
    location: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    salary: string | null;
    closingDate: Date;
    pdfUrl: string | null;
    published: boolean;
    contactName: string | null;
    contactEmail: string | null;
    contactTelephone: string | null;
    submissionLink: string | null;
    submissionEmail: string | null;
    submissionInstructions: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=vacancies.entity.d.ts.map