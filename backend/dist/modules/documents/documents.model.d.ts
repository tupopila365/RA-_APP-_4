export interface IDocument {
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: 'policy' | 'tender' | 'report' | 'other';
    indexed: boolean;
    uploadedById: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=documents.model.d.ts.map