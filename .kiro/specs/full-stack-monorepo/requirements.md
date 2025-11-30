# Requirements Document

## Introduction

This feature implements a complete full-stack monorepo system for the Roads Authority Namibia application, consisting of a Node.js/TypeScript backend, React/TypeScript admin dashboard, React Native/TypeScript mobile app, and a Python FastAPI RAG microservice powered by Ollama. The system enables admin users to manage content (news, vacancies, tenders, documents) and provides an AI-powered chatbot for mobile users that answers questions based on uploaded PDF documents.

## Glossary

- **Monorepo**: A single repository containing multiple related projects (backend, admin, app, rag-service)
- **Backend System**: Node.js + Express + TypeScript API server
- **Admin Dashboard**: React + TypeScript web application for content management
- **Mobile App**: React Native + TypeScript mobile application for end users
- **RAG Service**: Python FastAPI microservice using Retrieval-Augmented Generation with Ollama
- **RAG (Retrieval-Augmented Generation)**: AI technique that retrieves relevant documents and generates answers
- **Ollama**: Local LLM runtime for running models like llama3.1 and qwen2.5
- **ChromaDB**: Vector database for storing document embeddings
- **JWT**: JSON Web Token for authentication
- **Cloudinary**: Cloud service for file storage
- **MongoDB**: NoSQL database for storing application data
- **Redis**: In-memory data store for caching
- **PDF Document**: Portable Document Format files uploaded by admins for chatbot knowledge base

## Requirements

### Requirement 1

**User Story:** As a system architect, I want a monorepo structure with four separate projects, so that all components are organized and maintainable in a single repository.

#### Acceptance Criteria

1. THE Monorepo SHALL contain a backend directory with Node.js + Express + TypeScript
2. THE Monorepo SHALL contain an admin directory with React + TypeScript
3. THE Monorepo SHALL contain an app directory with React Native + TypeScript
4. THE Monorepo SHALL contain a rag-service directory with Python + FastAPI
5. THE Monorepo SHALL include a root-level README with setup instructions for all projects

### Requirement 2

**User Story:** As an admin user, I want to authenticate with JWT tokens and role-based access control, so that only authorized users can manage content.

#### Acceptance Criteria

1. WHEN an admin submits valid credentials, THE Backend System SHALL generate a JWT token
2. THE Backend System SHALL support two roles: super-admin and admin
3. WHEN a request includes a valid JWT token, THE Backend System SHALL authenticate the user
4. WHEN a request includes an invalid or expired JWT token, THE Backend System SHALL return a 401 error
5. THE Backend System SHALL protect all admin endpoints with authentication middleware

### Requirement 3

**User Story:** As an admin user, I want to upload PDF documents that are automatically indexed by the RAG system, so that the chatbot can answer questions based on these documents.

#### Acceptance Criteria

1. WHEN an admin uploads a PDF file, THE Backend System SHALL store the file in Cloudinary or local storage
2. WHEN a PDF is uploaded, THE Backend System SHALL save metadata in MongoDB
3. WHEN a PDF is successfully stored, THE Backend System SHALL send the file URL to the RAG Service at POST /index
4. WHEN the RAG Service receives a document URL, THE RAG Service SHALL download and process the PDF
5. THE Backend System SHALL return upload status and document ID to the admin

### Requirement 4

**User Story:** As a mobile app user, I want to ask questions to the chatbot and receive answers based on uploaded documents, so that I can get information about Roads Authority services.

#### Acceptance Criteria

1. WHEN a user submits a question via POST /chatbot/query, THE Backend System SHALL forward the question to the RAG Service
2. WHEN the RAG Service receives a query, THE RAG Service SHALL retrieve relevant document chunks
3. WHEN relevant chunks are found, THE RAG Service SHALL generate an answer using Ollama
4. THE RAG Service SHALL return the answer with source document references
5. THE Backend System SHALL return the formatted response to the mobile app

### Requirement 5

**User Story:** As an admin user, I want to manage news articles through CRUD operations, so that I can keep mobile users informed about Roads Authority updates.

#### Acceptance Criteria

1. THE Backend System SHALL provide POST /api/news endpoint to create news articles
2. THE Backend System SHALL provide GET /api/news endpoint to retrieve news articles with pagination
3. THE Backend System SHALL provide PUT /api/news/:id endpoint to update news articles
4. THE Backend System SHALL provide DELETE /api/news/:id endpoint to delete news articles
5. THE Backend System SHALL validate all news data before saving to MongoDB

### Requirement 6

**User Story:** As an admin user, I want to manage job vacancies through CRUD operations with optional PDF attachments, so that I can post employment opportunities.

#### Acceptance Criteria

1. THE Backend System SHALL provide POST /api/vacancies endpoint to create vacancies
2. THE Backend System SHALL support optional PDF attachment uploads for vacancies
3. THE Backend System SHALL provide GET /api/vacancies endpoint to retrieve vacancies with pagination
4. THE Backend System SHALL provide PUT /api/vacancies/:id endpoint to update vacancies
5. THE Backend System SHALL provide DELETE /api/vacancies/:id endpoint to delete vacancies

### Requirement 7

**User Story:** As an admin user, I want to manage tenders through CRUD operations with file download support, so that I can publish procurement opportunities.

#### Acceptance Criteria

1. THE Backend System SHALL provide POST /api/tenders endpoint to create tenders
2. THE Backend System SHALL support PDF file uploads for tender documents
3. THE Backend System SHALL provide GET /api/tenders endpoint to retrieve tenders with pagination
4. THE Backend System SHALL provide PUT /api/tenders/:id endpoint to update tenders
5. THE Backend System SHALL provide DELETE /api/tenders/:id endpoint to delete tenders

### Requirement 8

**User Story:** As an admin user, I want to manage homepage banners, so that I can control promotional content displayed to mobile users.

#### Acceptance Criteria

1. THE Backend System SHALL provide POST /api/banners endpoint to create banners
2. THE Backend System SHALL support image uploads for banners
3. THE Backend System SHALL provide GET /api/banners endpoint to retrieve active banners
4. THE Backend System SHALL provide PUT /api/banners/:id endpoint to update banners
5. THE Backend System SHALL provide DELETE /api/banners/:id endpoint to delete banners

### Requirement 9

**User Story:** As an admin user, I want to manage office locations, so that mobile users can find Roads Authority offices.

#### Acceptance Criteria

1. THE Backend System SHALL provide POST /api/locations endpoint to create locations
2. THE Backend System SHALL store location data including name, address, coordinates, and region
3. THE Backend System SHALL provide GET /api/locations endpoint to retrieve locations with region filtering
4. THE Backend System SHALL provide PUT /api/locations/:id endpoint to update locations
5. THE Backend System SHALL provide DELETE /api/locations/:id endpoint to delete locations

### Requirement 10

**User Story:** As a super-admin, I want to manage admin users and assign specific roles, so that I can control access to different management functions.

#### Acceptance Criteria

1. THE Admin Dashboard SHALL provide a user management interface for super-admins
2. THE Backend System SHALL support creating admin users with assigned roles
3. THE Backend System SHALL support five role types: News manager, Tenders manager, Vacancies manager, PDF uploader, Banner manager
4. THE Backend System SHALL enforce role-based permissions on all endpoints
5. THE Admin Dashboard SHALL display role-specific navigation based on logged-in user permissions

### Requirement 11

**User Story:** As an admin user, I want a web dashboard to manage all content types, so that I can efficiently update information without technical knowledge.

#### Acceptance Criteria

1. THE Admin Dashboard SHALL provide a login page with JWT authentication
2. THE Admin Dashboard SHALL display a navigation menu with access to all management modules
3. THE Admin Dashboard SHALL provide a PDF Document Manager with upload, list, delete, and preview functions
4. THE Admin Dashboard SHALL provide a News Manager with create, edit, and delete functions
5. THE Admin Dashboard SHALL provide managers for Vacancies, Tenders, Banners, and Locations

### Requirement 12

**User Story:** As a mobile app user, I want to browse news articles with search functionality, so that I can find relevant information quickly.

#### Acceptance Criteria

1. THE Mobile App SHALL display a news screen with a list of articles
2. THE Mobile App SHALL provide a search input to filter news by title or category
3. WHEN a user taps a news article, THE Mobile App SHALL navigate to a detail screen
4. THE Mobile App SHALL support pull-to-refresh on the news list
5. THE Mobile App SHALL display loading states while fetching news data

### Requirement 13

**User Story:** As a mobile app user, I want to view and download tender documents, so that I can participate in procurement opportunities.

#### Acceptance Criteria

1. THE Mobile App SHALL display a tenders screen with a list of available tenders
2. THE Mobile App SHALL provide filtering by tender status (Open, Closed, Upcoming)
3. WHEN a user taps download, THE Mobile App SHALL download the tender PDF document
4. THE Mobile App SHALL display tender details including reference number, closing date, and value
5. THE Mobile App SHALL support search functionality for tenders

### Requirement 14

**User Story:** As a mobile app user, I want to view job vacancies and their requirements, so that I can apply for positions at Roads Authority.

#### Acceptance Criteria

1. THE Mobile App SHALL display a vacancies screen with a list of job openings
2. THE Mobile App SHALL provide filtering by vacancy type (Full-time, Part-time, Bursaries, Internships)
3. WHEN a user taps a vacancy, THE Mobile App SHALL expand to show full details
4. THE Mobile App SHALL display requirements, responsibilities, and application deadlines
5. THE Mobile App SHALL support search functionality for vacancies

### Requirement 15

**User Story:** As a mobile app user, I want to find Roads Authority offices by region and open them in maps, so that I can visit physical locations.

#### Acceptance Criteria

1. THE Mobile App SHALL display a locations screen with a list of offices
2. THE Mobile App SHALL provide filtering by region
3. WHEN a user taps an office location, THE Mobile App SHALL open the address in the device's maps application
4. THE Mobile App SHALL display office details including name, address, and contact information
5. THE Mobile App SHALL show office locations organized by region

### Requirement 16

**User Story:** As a mobile app user, I want to interact with an AI chatbot that answers questions based on official documents, so that I can get accurate information instantly.

#### Acceptance Criteria

1. THE Mobile App SHALL provide a chatbot screen with a message input interface
2. WHEN a user sends a message, THE Mobile App SHALL display the message in the chat history
3. THE Mobile App SHALL send the question to POST /api/chatbot/query endpoint
4. WHEN a response is received, THE Mobile App SHALL display the answer with source document links
5. THE Mobile App SHALL show loading indicators while waiting for responses

### Requirement 17

**User Story:** As a developer, I want the RAG Service to process PDF documents and create searchable embeddings, so that the chatbot can retrieve relevant information.

#### Acceptance Criteria

1. WHEN the RAG Service receives POST /index with a document URL, THE RAG Service SHALL download the PDF
2. THE RAG Service SHALL extract text content from the PDF using a PDF parsing library
3. THE RAG Service SHALL split the text into chunks of appropriate size for embedding
4. THE RAG Service SHALL generate embeddings for each chunk using Ollama
5. THE RAG Service SHALL store embeddings and metadata in ChromaDB or Qdrant

### Requirement 18

**User Story:** As a developer, I want the RAG Service to retrieve relevant documents and generate answers using Ollama, so that users receive accurate AI-powered responses.

#### Acceptance Criteria

1. WHEN the RAG Service receives POST /query with a question, THE RAG Service SHALL generate an embedding for the question
2. THE RAG Service SHALL perform similarity search in the vector database to find relevant chunks
3. THE RAG Service SHALL retrieve the top 5 most relevant document chunks
4. THE RAG Service SHALL construct a prompt with the question and retrieved context
5. THE RAG Service SHALL generate an answer using llama3.1 or qwen2.5 model via Ollama

### Requirement 19

**User Story:** As a system administrator, I want comprehensive environment configuration files, so that I can deploy the system in different environments.

#### Acceptance Criteria

1. THE Monorepo SHALL include a .env.example file for the backend with all required variables
2. THE Monorepo SHALL include a .env.example file for the admin dashboard
3. THE Monorepo SHALL include a .env.example file for the RAG service
4. THE Monorepo SHALL include a root-level README with environment setup instructions
5. THE Monorepo SHALL include Docker Compose configuration for local development

### Requirement 20

**User Story:** As a developer, I want comprehensive API documentation, so that I can understand and integrate with all backend endpoints.

#### Acceptance Criteria

1. THE Monorepo SHALL include an API.md file documenting all backend endpoints
2. THE API documentation SHALL include request/response examples for each endpoint
3. THE API documentation SHALL document authentication requirements
4. THE API documentation SHALL document error responses and status codes
5. THE API documentation SHALL include examples for the RAG service endpoints
