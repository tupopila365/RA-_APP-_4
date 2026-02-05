export interface IVacancy {
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
    published: boolean;
    contactName?: string;
    contactEmail?: string;
    contactTelephone?: string;
    submissionLink?: string;
    submissionEmail?: string;
    submissionInstructions?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=vacancies.model.d.ts.map