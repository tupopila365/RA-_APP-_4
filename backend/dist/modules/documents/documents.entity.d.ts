import { User } from '../auth/auth.entity';
export type DocumentCategory = 'policy' | 'tender' | 'report' | 'other';
export declare class Document {
    id: number;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: DocumentCategory;
    indexed: boolean;
    uploadedById: number;
    uploadedBy: User;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=documents.entity.d.ts.map