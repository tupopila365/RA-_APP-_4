export interface IFAQ {
  question: string;
  answer: string;
  category?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
