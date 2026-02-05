export declare class Form {
    id: number;
    name: string;
    category: 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy';
    documents: Array<{
        title: string;
        url: string;
        fileName: string;
    }>;
    published: boolean;
    publishedAt: Date | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=forms.entity.d.ts.map