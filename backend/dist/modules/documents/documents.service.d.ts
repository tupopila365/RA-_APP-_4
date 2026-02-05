import { Document } from './documents.entity';
export interface CreateDocumentDTO {
    title: string;
    description: string;
    category: 'policy' | 'tender' | 'report' | 'other';
    uploadedBy: string;
}
export interface ListDocumentsQuery {
    page?: number;
    limit?: number;
    category?: string;
    indexed?: boolean;
    search?: string;
}
export interface ListDocumentsResult {
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
}
declare class DocumentsService {
    /**
     * Upload file to Cloudinary
     */
    uploadFileToCloudinary(fileBuffer: Buffer, fileName: string): Promise<{
        url: string;
        publicId: string;
        size: number;
    }>;
    /**
     * Create a new document with file upload and RAG indexing
     */
    createDocument(dto: CreateDocumentDTO, file: Express.Multer.File): Promise<Document>;
    /**
     * Index document in RAG service and update indexed status
     */
    private indexDocumentInRAG;
    /**
     * List documents with pagination and filtering
     */
    listDocuments(query: ListDocumentsQuery): Promise<ListDocumentsResult>;
    /**
     * Get a single document by ID
     */
    getDocumentById(documentId: string): Promise<Document>;
    /**
     * Delete a document
     */
    deleteDocument(documentId: string): Promise<void>;
    /**
     * Get indexing progress from RAG service
     */
    getIndexingProgress(documentId: string): Promise<any>;
}
export declare const documentsService: DocumentsService;
export {};
//# sourceMappingURL=documents.service.d.ts.map