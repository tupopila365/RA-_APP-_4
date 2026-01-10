import mongoose, { Document as MongooseDocument } from 'mongoose';
export interface IVacancy extends MongooseDocument {
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
export declare const VacancyModel: mongoose.Model<IVacancy, {}, {}, {}, mongoose.Document<unknown, {}, IVacancy, {}, {}> & IVacancy & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=vacancies.model.d.ts.map