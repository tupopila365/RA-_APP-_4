# Design Document

## Overview

This design document outlines the technical architecture for a complete full-stack monorepo system consisting of four interconnected projects: a Node.js/TypeScript backend API, a React/TypeScript admin dashboard, a React Native/TypeScript mobile application, and a Python FastAPI RAG microservice. The system enables content management by admin users and provides an AI-powered chatbot experience for mobile users based on uploaded PDF documents.

## Architecture

### Monorepo Structure

```
roads-authority-monorepo/
├── backend/                 # Node.js + Express + TypeScript
├── admin/                   # React + TypeScript
├── app/                     # React Native + TypeScript (existing app converted)
├── rag-service/             # Python + FastAPI + Ollama
├── docker-compose.yml       # Local development orchestration
├── .env.example             # Environment variables template
├── README.md                # Setup and run instructions
└── API.md                   # API documentation
```

### System Architecture Diagram

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Admin Dashboard│      │   Backend API    │
│  (React + TS)   │◄────►│ (Node + Express) │
└─────────────────┘      └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌─────────┐  ┌──────────┐
              │ MongoDB  │  │  Redis  │  │Cloudinary│
              └──────────┘  └─────────┘  └──────────┘
                                  │
                                  │ HTTP
                                  ▼
                          ┌───────────────┐
                          │  RAG Service  │
                          │ (FastAPI)     │
                          └───────┬───────┘
                                  │
                          ┌───────┼───────┐
                          ▼       ▼       ▼
                      ┌────┐  ┌────┐  ┌────┐
                      │Olla│  │Chro│  │PDF │
                      │ma  │  │maDB│  │Proc│
                      └────┘  └────┘  └────┘
```

## Components and Interfaces

### 1. Backend API (Node.js + Express + TypeScript)

#### Project Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── env.ts                # Environment variables
│   │   ├── db.ts                 # MongoDB connection
│   │   ├── cloudinary.ts         # Cloudinary configuration
│   │   └── redis.ts              # Redis configuration
│   ├── middlewares/
│   │   ├── auth.ts               # JWT authentication
│   │   ├── upload.ts             # Multer file upload
│   │   ├── roleGuard.ts          # Role-based access control
│   │   └── errorHandler.ts       # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.model.ts
│   │   ├── news/
│   │   │   ├── news.controller.ts
│   │   │   ├── news.service.ts
│   │   │   ├── news.routes.ts
│   │   │   └── news.model.ts
│   │   ├── vacancies/
│   │   │   ├── vacancies.controller.ts
│   │   │   ├── vacancies.service.ts
│   │   │   ├── vacancies.routes.ts
│   │   │   └── vacancies.model.ts
│   │   ├── tenders/
│   │   │   ├── tenders.controller.ts
│   │   │   ├── tenders.service.ts
│   │   │   ├── tenders.routes.ts
│   │   │   └── tenders.model.ts
│   │   ├── banners/
│   │   │   ├── banners.controller.ts
│   │   │   ├── banners.service.ts
│   │   │   ├── banners.routes.ts
│   │   │   └── banners.model.ts
│   │   ├── locations/
│   │   │   ├── locations.controller.ts
│   │   │   ├── locations.service.ts
│   │   │   ├── locations.routes.ts
│   │   │   └── locations.model.ts
│   │   ├── documents/
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── documents.routes.ts
│   │   │   └── documents.model.ts
│   │   └── chatbot/
│   │       ├── chatbot.controller.ts
│   │       ├── chatbot.service.ts
│   │       └── chatbot.routes.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── httpClient.ts
│   └── constants/
│       ├── roles.ts
│       └── errors.ts
├── package.json
├── tsconfig.json
└── .env.example
```

#### Key Interfaces

```typescript
// User & Authentication
interface IUser {
  _id: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Documents
interface IDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: 'policy' | 'tender' | 'report' | 'other';
  indexed: boolean;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// News
interface INews {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Vacancies
interface IVacancy {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

// Tenders
interface ITender {
  _id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: 'open' | 'closed' | 'upcoming';
  openingDate: Date;
  closingDate: Date;
  pdfUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Banners
interface IBanner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Locations
interface ILocation {
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
  createdAt: Date;
  updatedAt: Date;
}

// Chatbot
interface IChatbotQuery {
  question: string;
  sessionId?: string;
}

interface IChatbotResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    title: string;
    relevance: number;
  }>;
  timestamp: Date;
}

#
### API Endpoints

**Authentication**
- `POST /api/auth/login` - Admin login with JWT token generation
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate refresh token

**Documents (PDF Management)**
- `POST /api/documents` - Upload PDF and trigger RAG indexing
- `GET /api/documents` - List all documents with pagination
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document and remove from RAG index

**News**
- `POST /api/news` - Create news article (requires auth)
- `GET /api/news` - List news with pagination and search
- `GET /api/news/:id` - Get single news article
- `PUT /api/news/:id` - Update news article (requires auth)
- `DELETE /api/news/:id` - Delete news article (requires auth)

**Vacancies**
- `POST /api/vacancies` - Create vacancy with optional PDF (requires auth)
- `GET /api/vacancies` - List vacancies with filtering by type
- `GET /api/vacancies/:id` - Get vacancy details
- `PUT /api/vacancies/:id` - Update vacancy (requires auth)
- `DELETE /api/vacancies/:id` - Delete vacancy (requires auth)

**Tenders**
- `POST /api/tenders` - Create tender with PDF document (requires auth)
- `GET /api/tenders` - List tenders with status filtering
- `GET /api/tenders/:id` - Get tender details
- `PUT /api/tenders/:id` - Update tender (requires auth)
- `DELETE /api/tenders/:id` - Delete tender (requires auth)

**Banners**
- `POST /api/banners` - Create banner with image upload (requires auth)
- `GET /api/banners` - List active banners
- `PUT /api/banners/:id` - Update banner (requires auth)
- `DELETE /api/banners/:id` - Delete banner (requires auth)

**Locations**
- `POST /api/locations` - Create office location (requires auth)
- `GET /api/locations` - List locations with region filtering
- `PUT /api/locations/:id` - Update location (requires auth)
- `DELETE /api/locations/:id` - Delete location (requires auth)

**Chatbot**
- `POST /api/chatbot/query` - Send question to RAG service and get AI response

**User Management (Super-Admin only)**
- `POST /api/users` - Create admin user with role assignment
- `GET /api/users` - List all admin users
- `PUT /api/users/:id` - Update user role and permissions
- `DELETE /api/users/:id` - Delete admin user

#### Authentication & Authorization Design

**JWT Token Strategy:**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens stored in Redis for revocation capability
- Tokens include user ID, role, and permissions in payload

**Role-Based Access Control (RBAC):**
The system implements granular role-based permissions to support Requirement 10. Each admin user has a primary role and specific permissions:

**Roles:**
- `super-admin`: Full system access including user management
- `admin`: Content management access based on assigned permissions

**Permissions:**
- `news:manage` - Create, edit, delete news articles
- `tenders:manage` - Create, edit, delete tenders
- `vacancies:manage` - Create, edit, delete vacancies
- `documents:upload` - Upload and manage PDF documents
- `banners:manage` - Create, edit, delete banners
- `locations:manage` - Create, edit, delete office locations
- `users:manage` - Manage admin users (super-admin only)

**Design Rationale:** This granular permission system allows super-admins to create specialized admin accounts (e.g., a "News Manager" with only `news:manage` permission), improving security and workflow organization as specified in Requirement 10.

#### Document Upload & RAG Integration Flow

1. Admin uploads PDF via `POST /api/documents`
2. Backend validates file (PDF only, max 10MB)
3. File uploaded to Cloudinary or local storage
4. Document metadata saved to MongoDB with `indexed: false`
5. Backend sends HTTP POST to RAG Service `/index` endpoint with document URL
6. RAG Service downloads PDF, processes it, and stores embeddings
7. RAG Service returns success/failure status
8. Backend updates document `indexed: true` in MongoDB
9. Admin receives upload confirmation

**Design Rationale:** Asynchronous indexing allows the admin to continue working while documents are processed. The `indexed` flag enables the system to track which documents are available for chatbot queries, addressing Requirements 3 and 17.

### 2. Admin Dashboard (React + TypeScript)

#### Project Structure

```
admin/
├── src/
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # Entry point
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── Header.tsx        # Top header with user info
│   │   │   └── Layout.tsx        # Main layout wrapper
│   │   ├── Auth/
│   │   │   └── LoginForm.tsx     # Login form component
│   │   └── common/
│   │       ├── DataTable.tsx     # Reusable table component
│   │       ├── FileUpload.tsx    # File upload component
│   │       ├── RichTextEditor.tsx # WYSIWYG editor for content
│   │       └── ConfirmDialog.tsx # Confirmation modal
│   ├── pages/
│   │   ├── Login.tsx             # Login page
│   │   ├── Dashboard.tsx         # Dashboard home
│   │   ├── Documents/
│   │   │   ├── DocumentList.tsx  # PDF document manager
│   │   │   └── DocumentUpload.tsx
│   │   ├── News/
│   │   │   ├── NewsList.tsx
│   │   │   ├── NewsForm.tsx
│   │   │   └── NewsDetail.tsx
│   │   ├── Vacancies/
│   │   │   ├── VacanciesList.tsx
│   │   │   └── VacancyForm.tsx
│   │   ├── Tenders/
│   │   │   ├── TendersList.tsx
│   │   │   └── TenderForm.tsx
│   │   ├── Banners/
│   │   │   ├── BannersList.tsx
│   │   │   └── BannerForm.tsx
│   │   ├── Locations/
│   │   │   ├── LocationsList.tsx
│   │   │   └── LocationForm.tsx
│   │   └── Users/
│   │       ├── UsersList.tsx     # Super-admin only
│   │       └── UserForm.tsx
│   ├── services/
│   │   ├── api.ts                # Axios instance with interceptors
│   │   ├── auth.service.ts       # Authentication API calls
│   │   ├── documents.service.ts
│   │   ├── news.service.ts
│   │   ├── vacancies.service.ts
│   │   ├── tenders.service.ts
│   │   ├── banners.service.ts
│   │   ├── locations.service.ts
│   │   └── users.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── usePermissions.ts     # Permission checking hook
│   │   └── useApi.ts             # API call hook with loading states
│   ├── context/
│   │   └── AuthContext.tsx       # Global auth state
│   ├── utils/
│   │   ├── validators.ts
│   │   └── formatters.ts
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

#### Key Features

**Role-Based Navigation (Requirement 10):**
The sidebar dynamically renders menu items based on the logged-in user's permissions:

```typescript
// Example navigation logic
const navigationItems = [
  { label: 'Dashboard', path: '/', permission: null },
  { label: 'Documents', path: '/documents', permission: 'documents:upload' },
  { label: 'News', path: '/news', permission: 'news:manage' },
  { label: 'Vacancies', path: '/vacancies', permission: 'vacancies:manage' },
  { label: 'Tenders', path: '/tenders', permission: 'tenders:manage' },
  { label: 'Banners', path: '/banners', permission: 'banners:manage' },
  { label: 'Locations', path: '/locations', permission: 'locations:manage' },
  { label: 'Users', path: '/users', permission: 'users:manage' },
];
```

**Design Rationale:** Dynamic navigation ensures admins only see sections they have permission to access, reducing confusion and improving security (Requirement 11).

**PDF Document Manager (Requirement 11):**
- Upload interface with drag-and-drop support
- Document list with title, category, upload date, and indexed status
- Preview functionality using PDF.js
- Delete with confirmation dialog
- Visual indicator showing indexing progress

**Content Managers:**
Each content type (News, Vacancies, Tenders, Banners, Locations) follows a consistent pattern:
- List view with search, filter, and pagination
- Create/Edit forms with validation
- Rich text editor for content fields
- Image/PDF upload components
- Publish/unpublish toggle

### 3. Mobile App (React Native + TypeScript)

#### Project Structure

The existing React Native app will be integrated into the monorepo with minimal structural changes:

```
app/
├── App.js                        # Main app entry (existing)
├── components/                   # Existing components
├── screens/
│   ├── HomeScreen.js             # Updated to fetch banners
│   ├── NewsScreen.js             # Updated with search
│   ├── NewsDetailScreen.js
│   ├── VacanciesScreen.js        # Updated with filtering
│   ├── TendersScreen.js          # Updated with download
│   ├── LocationsScreen.js        # Updated with maps integration
│   └── ChatbotScreen.js          # NEW: AI chatbot interface
├── services/
│   ├── api.js                    # Updated API base URL
│   ├── newsService.js
│   ├── vacanciesService.js
│   ├── tendersService.js
│   ├── locationsService.js
│   ├── bannersService.js
│   └── chatbotService.js         # NEW: Chatbot API calls
├── context/                      # Existing context
├── hooks/                        # Existing hooks
└── utils/                        # Existing utilities
```

#### Key Features & Updates

**Home Screen with Banners (Requirement 8):**
- Fetch banners from `GET /api/banners`
- Display carousel/slider of active banners
- Handle banner tap to open linked URLs

**News Screen with Search (Requirement 12):**
- List view with pull-to-refresh
- Search input filtering by title/category
- Category filter chips
- Navigation to detail screen on tap
- Loading skeleton screens

**Tenders Screen with Download (Requirement 13):**
- List view with status badges (Open, Closed, Upcoming)
- Filter by status
- Search functionality
- Download PDF button using `react-native-fs` or `expo-file-system`
- Display reference number, closing date, and value

**Vacancies Screen with Filtering (Requirement 14):**
- List view with expandable cards
- Filter by type (Full-time, Part-time, Bursaries, Internships)
- Search functionality
- Display requirements, responsibilities, and closing date
- Optional PDF download for application forms

**Locations Screen with Maps (Requirement 15):**
- List view grouped by region
- Region filter dropdown
- Tap to open in device maps app (Google Maps/Apple Maps)
- Display office name, address, and contact info

**Chatbot Screen (Requirement 16):**
- Chat interface with message bubbles
- Text input with send button
- Display user messages immediately
- Show loading indicator while waiting for AI response
- Display AI responses with source document links
- Tap source link to view document details
- Persistent chat history (local storage)

**Design Rationale:** The chatbot screen provides an intuitive conversational interface for users to get instant answers about Roads Authority services, leveraging the RAG system to provide accurate, document-backed responses (Requirements 4, 16).

### 4. RAG Service (Python + FastAPI)

#### Project Structure

```
rag-service/
├── app/
│   ├── main.py                   # FastAPI app entry point
│   ├── config.py                 # Environment configuration
│   ├── models/
│   │   ├── schemas.py            # Pydantic models
│   │   └── document.py           # Document data model
│   ├── services/
│   │   ├── pdf_processor.py     # PDF text extraction
│   │   ├── embeddings.py        # Ollama embedding generation
│   │   ├── vector_store.py      # ChromaDB operations
│   │   └── llm.py               # Ollama LLM interaction
│   ├── routers/
│   │   ├── index.py             # POST /index endpoint
│   │   └── query.py             # POST /query endpoint
│   └── utils/
│       ├── chunking.py          # Text chunking strategies
│       └── logger.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

#### Key Components

**PDF Processing Pipeline (Requirement 17):**

1. **Document Download:** Fetch PDF from provided URL
2. **Text Extraction:** Use `PyPDF2` or `pdfplumber` to extract text
3. **Text Chunking:** Split text into overlapping chunks (500 tokens, 50 token overlap)
4. **Embedding Generation:** Generate embeddings using Ollama's embedding model
5. **Vector Storage:** Store embeddings in ChromaDB with metadata

**Design Rationale:** Overlapping chunks ensure context isn't lost at chunk boundaries. Chunk size of 500 tokens balances retrieval granularity with context completeness (Requirement 17).

**Query Processing Pipeline (Requirement 18):**

1. **Query Embedding:** Generate embedding for user question
2. **Similarity Search:** Find top 5 most relevant chunks in ChromaDB
3. **Context Assembly:** Combine retrieved chunks with source metadata
4. **Prompt Construction:** Build prompt with system instructions, context, and question
5. **LLM Generation:** Send to Ollama (llama3.1 or qwen2.5) for answer generation
6. **Response Formatting:** Return answer with source document references

**Prompt Template:**
```
You are a helpful assistant for Roads Authority Namibia. Answer the question based on the provided context from official documents. If the answer is not in the context, say so.

Context:
{retrieved_chunks}

Question: {user_question}

Answer:
```

**Design Rationale:** The prompt explicitly instructs the LLM to only use provided context, reducing hallucinations. Including source metadata allows users to verify information (Requirement 18).

#### API Endpoints

**POST /index**
- Request: `{ "document_url": "string", "document_id": "string", "title": "string" }`
- Response: `{ "status": "success", "chunks_indexed": 42 }`
- Process: Download PDF, extract text, chunk, embed, store in ChromaDB

**POST /query**
- Request: `{ "question": "string", "top_k": 5 }`
- Response: `{ "answer": "string", "sources": [...], "confidence": 0.85 }`
- Process: Embed question, search vectors, retrieve context, generate answer

**GET /health**
- Response: `{ "status": "healthy", "ollama_connected": true, "chromadb_connected": true }`

#### Ollama Configuration

**Models Used:**
- **Embedding Model:** `nomic-embed-text:latest` (768-dimensional embeddings)
- **LLM Model:** `llama3.2:1b` or `qwen2.5:7b` (configurable)

**Design Rationale:** `nomic-embed-text:latest` is optimized for retrieval tasks. Llama 3.1 and Qwen 2.5 provide strong instruction-following and reasoning capabilities while being runnable on consumer hardware (Requirements 17, 18).

## Data Models

### MongoDB Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  role: String (enum: ['super-admin', 'admin']),
  permissions: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**documents**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  fileUrl: String,
  fileType: String,
  fileSize: Number,
  category: String (enum: ['policy', 'tender', 'report', 'other']),
  indexed: Boolean (default: false),
  uploadedBy: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

**news**
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  content: String,
  excerpt: String,
  category: String,
  author: String,
  imageUrl: String,
  published: Boolean (default: false),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**vacancies**
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  type: String (enum: ['full-time', 'part-time', 'bursary', 'internship']),
  department: String,
  location: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  salary: String,
  closingDate: Date (indexed),
  pdfUrl: String,
  published: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**tenders**
```javascript
{
  _id: ObjectId,
  referenceNumber: String (unique, indexed),
  title: String (indexed),
  description: String,
  category: String,
  value: Number,
  status: String (enum: ['open', 'closed', 'upcoming']),
  openingDate: Date,
  closingDate: Date (indexed),
  pdfUrl: String (required),
  published: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**banners**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String (required),
  linkUrl: String,
  order: Number (indexed),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**locations**
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  region: String (indexed),
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  contactNumber: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ChromaDB Collections

**document_chunks**
```python
{
  "id": "doc_id_chunk_index",
  "embedding": [768-dimensional vector],
  "metadata": {
    "document_id": "string",
    "document_title": "string",
    "chunk_index": int,
    "total_chunks": int,
    "page_number": int
  },
  "document": "chunk text content"
}
```

### Redis Cache Structure

**JWT Tokens:**
- Key: `token:refresh:{userId}`
- Value: Refresh token string
- TTL: 7 days

**Session Data:**
- Key: `session:{userId}`
- Value: JSON serialized user data
- TTL: 15 minutes

## Error Handling

### Backend API Error Responses

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

**Error Codes:**
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `VALIDATION_001`: Invalid input data
- `UPLOAD_001`: File upload failed
- `UPLOAD_002`: Invalid file type
- `UPLOAD_003`: File size exceeded
- `DB_001`: Database operation failed
- `RAG_001`: RAG service unavailable
- `RAG_002`: Document indexing failed
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error

**Global Error Handler Middleware:**
- Catches all unhandled errors
- Logs errors with stack traces
- Returns sanitized error responses to clients
- Sends critical errors to monitoring service (future enhancement)

**Design Rationale:** Consistent error codes enable the frontend to display user-friendly messages and handle specific error scenarios programmatically.

### RAG Service Error Handling

**PDF Processing Errors:**
- Invalid PDF format → Return 400 with descriptive message
- Download failure → Retry 3 times with exponential backoff
- Text extraction failure → Log error, return partial success

**Ollama Connection Errors:**
- Connection timeout → Return 503 Service Unavailable
- Model not found → Return 500 with model installation instructions
- Generation timeout → Return 408 Request Timeout

**ChromaDB Errors:**
- Connection failure → Retry with exponential backoff
- Storage full → Return 507 Insufficient Storage

### Mobile App Error Handling

**Network Errors:**
- Display toast notification with retry button
- Cache last successful data for offline viewing
- Show offline indicator in UI

**API Errors:**
- Parse error codes and display user-friendly messages
- Handle 401 errors by redirecting to login
- Handle 403 errors by showing permission denied message

## Testing Strategy

### Backend API Testing

**Unit Tests:**
- Service layer business logic
- Utility functions (validators, formatters)
- Middleware functions (auth, role guards)
- Target: 80% code coverage

**Integration Tests:**
- API endpoint tests with test database
- Authentication flow tests
- File upload tests with mock Cloudinary
- RAG service integration tests with mock HTTP client

**Tools:** Jest, Supertest, MongoDB Memory Server

### Admin Dashboard Testing

**Unit Tests:**
- Component rendering tests
- Hook logic tests
- Service function tests

**Integration Tests:**
- User flow tests (login, create content, logout)
- Form validation tests
- API integration tests with MSW (Mock Service Worker)

**E2E Tests:**
- Critical user journeys (upload document, create news)
- Role-based access tests

**Tools:** Vitest, React Testing Library, Playwright

### Mobile App Testing

**Unit Tests:**
- Component rendering tests
- Service function tests
- Utility function tests

**Integration Tests:**
- Navigation flow tests
- API integration tests with mock responses

**E2E Tests:**
- Critical user flows (browse news, use chatbot)
- Device-specific tests (iOS/Android)

**Tools:** Jest, React Native Testing Library, Detox

### RAG Service Testing

**Unit Tests:**
- PDF processing functions
- Text chunking logic
- Embedding generation (with mock Ollama)

**Integration Tests:**
- Full indexing pipeline with test PDFs
- Query pipeline with test vector database
- Ollama integration tests

**Tools:** pytest, pytest-asyncio, unittest.mock

### Manual Testing Checklist

**Admin Dashboard:**
- [ ] Login with different roles
- [ ] Upload PDF and verify indexing
- [ ] Create/edit/delete content in all modules
- [ ] Verify role-based navigation
- [ ] Test file uploads (images, PDFs)

**Mobile App:**
- [ ] Browse all content types
- [ ] Test search and filtering
- [ ] Download tender PDFs
- [ ] Open locations in maps
- [ ] Chat with AI bot and verify responses
- [ ] Test on iOS and Android devices

**RAG Service:**
- [ ] Upload various PDF formats
- [ ] Test with different question types
- [ ] Verify source attribution
- [ ] Test with documents in different languages (if applicable)

**Design Rationale:** Comprehensive testing ensures system reliability and catches regressions early. The focus on integration and E2E tests validates that all components work together correctly, which is critical for a multi-service architecture (Requirements 1-20).
