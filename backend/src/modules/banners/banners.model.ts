export interface IBanner {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
