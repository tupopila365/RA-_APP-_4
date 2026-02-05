export interface IFormDocument {
  title: string;
  url: string;
  fileName: string;
}

export interface IForm {
  name: string;
  category: 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy';
  documents: IFormDocument[];
  published: boolean;
  publishedAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
