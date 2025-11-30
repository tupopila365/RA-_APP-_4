// User & Authentication Types
export interface IUser {
  _id: string;
  email: string;
  role: 'super-admin' | 'admin';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  data: {
    user: IUser;
    tokens: IAuthTokens;
  };
}

// Document Types
export interface IDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: 'policy' | 'tender' | 'report' | 'other';
  indexed: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// News Types
export interface INews {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Vacancy Types
export interface IVacancy {
  _id: string;
  title: string;
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: string;
  pdfUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tender Types
export interface ITender {
  _id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: 'open' | 'closed' | 'upcoming';
  openingDate: string;
  closingDate: string;
  pdfUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Banner Types
export interface IBanner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Location Types
export interface ILocation {
  _id: string;
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Permission Types
export type Permission =
  | 'news:manage'
  | 'tenders:manage'
  | 'vacancies:manage'
  | 'documents:upload'
  | 'banners:manage'
  | 'locations:manage'
  | 'users:manage';

export type Role = 'super-admin' | 'admin';
