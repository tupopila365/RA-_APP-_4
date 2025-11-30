# Implementation Plan

- [x] 1. Set up monorepo structure and shared configuration





  - Create root directory structure with backend/, admin/, app/, and rag-service/ folders
  - Create root-level README.md with setup instructions for all projects
  - Create root-level .env.example with environment variables template
  - Create docker-compose.yml for local development orchestration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 19.4, 19.5_

- [x] 2. Set up Backend API project structure and core configuration





  - [x] 2.1 Initialize Node.js + TypeScript project with Express


    - Create backend/package.json with dependencies (express, typescript, mongoose, redis, jsonwebtoken, multer, cloudinary)
    - Create backend/tsconfig.json with strict TypeScript configuration
    - Create backend/src directory structure (config/, middlewares/, modules/, utils/, constants/)
    - _Requirements: 1.1_
  
  - [x] 2.2 Implement configuration modules


    - Create config/env.ts for environment variable management
    - Create config/db.ts for MongoDB connection with error handling
    - Create config/redis.ts for Redis client initialization
    - Create config/cloudinary.ts for Cloudinary SDK configuration
    - Create backend/.env.example with all required environment variables
    - _Requirements: 19.1_
  
  - [x] 2.3 Create core middleware functions


    - Implement middlewares/auth.ts for JWT token verification
    - Implement middlewares/roleGuard.ts for permission-based access control
    - Implement middlewares/upload.ts for Multer file upload configuration
    - Implement middlewares/errorHandler.ts for global error handling
    - _Requirements: 2.3, 2.4, 2.5_
  

  - [x] 2.4 Implement constants and utilities

    - Create constants/roles.ts with role and permission definitions
    - Create constants/errors.ts with error code constants
    - Create utils/logger.ts for Winston logging configuration
    - Create utils/validators.ts for input validation helpers
    - Create utils/httpClient.ts for Axios instance to call RAG service
    - _Requirements: 2.2, 10.3_

- [x] 3. Implement authentication module




  - [x] 3.1 Create User model and authentication service


    - Create modules/auth/auth.model.ts with User schema (email, password, role, permissions)
    - Implement password hashing with bcrypt in User model
    - Create modules/auth/auth.service.ts with login, token generation, and refresh logic
    - Implement JWT token generation with 15-minute access and 7-day refresh tokens
    - Implement Redis storage for refresh tokens
    - _Requirements: 2.1, 2.2_
  

  - [x] 3.2 Create authentication controller and routes

    - Implement modules/auth/auth.controller.ts with login, refresh, and logout handlers
    - Create modules/auth/auth.routes.ts with POST /api/auth/login, /api/auth/refresh, /api/auth/logout
    - Wire authentication routes into main Express app
    - _Requirements: 2.1, 2.4_

- [x] 4. Implement documents module for PDF management




  - [x] 4.1 Create Document model and service


    - Create modules/documents/documents.model.ts with schema (title, description, fileUrl, category, indexed, uploadedBy)
    - Implement modules/documents/documents.service.ts with CRUD operations
    - Implement file upload to Cloudinary or local storage
    - Implement HTTP call to RAG service POST /index endpoint after successful upload
    - Implement indexed status update after RAG indexing confirmation
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [x] 4.2 Create documents controller and routes


    - Implement modules/documents/documents.controller.ts with upload, list, get, and delete handlers
    - Create modules/documents/documents.routes.ts with POST /api/documents, GET /api/documents, GET /api/documents/:id, DELETE /api/documents/:id
    - Apply auth middleware and documents:upload permission guard
    - Wire documents routes into main Express app
    - _Requirements: 3.1, 3.5_

- [x] 5. Implement news module




  - [x] 5.1 Create News model and service


    - Create modules/news/news.model.ts with schema (title, content, excerpt, category, author, imageUrl, published)
    - Implement modules/news/news.service.ts with CRUD operations and pagination
    - Implement search functionality by title and category
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 5.2 Create news controller and routes


    - Implement modules/news/news.controller.ts with create, list, get, update, and delete handlers
    - Create modules/news/news.routes.ts with POST /api/news, GET /api/news, GET /api/news/:id, PUT /api/news/:id, DELETE /api/news/:id
    - Apply auth middleware and news:manage permission guard to protected routes
    - Wire news routes into main Express app
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implement vacancies module




  - [x] 6.1 Create Vacancy model and service


    - Create modules/vacancies/vacancies.model.ts with schema (title, type, department, location, description, requirements, responsibilities, closingDate, pdfUrl)
    - Implement modules/vacancies/vacancies.service.ts with CRUD operations and pagination
    - Implement filtering by vacancy type and search functionality
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 6.2 Create vacancies controller and routes


    - Implement modules/vacancies/vacancies.controller.ts with create, list, get, update, and delete handlers
    - Create modules/vacancies/vacancies.routes.ts with POST /api/vacancies, GET /api/vacancies, GET /api/vacancies/:id, PUT /api/vacancies/:id, DELETE /api/vacancies/:id
    - Apply auth middleware and vacancies:manage permission guard to protected routes
    - Wire vacancies routes into main Express app
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 7. Implement tenders module




  - [x] 7.1 Create Tender model and service


    - Create modules/tenders/tenders.model.ts with schema (referenceNumber, title, description, category, value, status, openingDate, closingDate, pdfUrl)
    - Implement modules/tenders/tenders.service.ts with CRUD operations and pagination
    - Implement filtering by status and search functionality
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 7.2 Create tenders controller and routes


    - Implement modules/tenders/tenders.controller.ts with create, list, get, update, and delete handlers
    - Create modules/tenders/tenders.routes.ts with POST /api/tenders, GET /api/tenders, GET /api/tenders/:id, PUT /api/tenders/:id, DELETE /api/tenders/:id
    - Apply auth middleware and tenders:manage permission guard to protected routes
    - Wire tenders routes into main Express app
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

- [x] 8. Implement banners module




  - [x] 8.1 Create Banner model and service


    - Create modules/banners/banners.model.ts with schema (title, description, imageUrl, linkUrl, order, active)
    - Implement modules/banners/banners.service.ts with CRUD operations
    - Implement query to fetch only active banners ordered by order field
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 8.2 Create banners controller and routes


    - Implement modules/banners/banners.controller.ts with create, list, update, and delete handlers
    - Create modules/banners/banners.routes.ts with POST /api/banners, GET /api/banners, PUT /api/banners/:id, DELETE /api/banners/:id
    - Apply auth middleware and banners:manage permission guard to protected routes
    - Wire banners routes into main Express app
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [x] 9. Implement locations module




  - [x] 9.1 Create Location model and service


    - Create modules/locations/locations.model.ts with schema (name, address, region, coordinates, contactNumber, email)
    - Implement modules/locations/locations.service.ts with CRUD operations
    - Implement filtering by region
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 9.2 Create locations controller and routes


    - Implement modules/locations/locations.controller.ts with create, list, update, and delete handlers
    - Create modules/locations/locations.routes.ts with POST /api/locations, GET /api/locations, PUT /api/locations/:id, DELETE /api/locations/:id
    - Apply auth middleware and locations:manage permission guard to protected routes
    - Wire locations routes into main Express app
    - _Requirements: 9.1, 9.3, 9.4, 9.5_

- [x] 10. Implement chatbot module




  - [x] 10.1 Create chatbot service and controller


    - Implement modules/chatbot/chatbot.service.ts to forward queries to RAG service POST /query endpoint
    - Implement response formatting with source document references
    - Create modules/chatbot/chatbot.controller.ts with query handler
    - Create modules/chatbot/chatbot.routes.ts with POST /api/chatbot/query
    - Wire chatbot routes into main Express app (no auth required for mobile users)
    - _Requirements: 4.1, 4.5_

- [x] 11. Implement user management module (super-admin only)










  - [x] 11.1 Create users service and controller







    - Implement modules/auth/users.service.ts with create, list, update, and delete admin users
    - Implement role and permission assignment logic
    - Create modules/auth/users.controller.ts with user management handlers
    - Create modules/auth/users.routes.ts with POST /api/users, GET /api/users, PUT /api/users/:id, DELETE /api/users/:id
    - Apply auth middleware and users:manage permission guard (super-admin only)
    - Wire users routes into main Express app
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 12. Create Express app entry point and server






  - [x] 12.1 Wire all modules and start server

    - Create src/app.ts to configure Express app with middleware, routes, and error handler
    - Create src/server.ts to start HTTP server and connect to MongoDB and Redis
    - Implement graceful shutdown handling
    - _Requirements: 1.1_

- [x] 13. Create API documentation




  - [x] 13.1 Write comprehensive API documentation


    - Create API.md at root level with all backend endpoints documented
    - Include request/response examples for each endpoint
    - Document authentication requirements and error codes
    - Document RAG service endpoints
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 14. Set up RAG Service project structure




  - [x] 14.1 Initialize Python FastAPI project


    - Create rag-service/requirements.txt with dependencies (fastapi, uvicorn, pydantic, chromadb, ollama, PyPDF2, requests)
    - Create rag-service/app directory structure (models/, services/, routers/, utils/)
    - Create rag-service/.env.example with required environment variables
    - Create rag-service/Dockerfile for containerization
    - _Requirements: 1.4, 19.3_


  
  - [x] 14.2 Implement configuration and models




    - Create app/config.py for environment variable management
    - Create app/models/schemas.py with Pydantic models for requests/responses
    - Create app/models/document.py for document data model
    - _Requirements: 1.4_

- [x] 15. Implement PDF processing pipeline




  - [x] 15.1 Create PDF processor and chunking utilities


    - Implement app/services/pdf_processor.py to download and extract text from PDFs using PyPDF2
    - Implement app/utils/chunking.py to split text into 500-token chunks with 50-token overlap
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [x] 15.2 Implement embedding and vector storage services


    - Implement app/services/embeddings.py to generate embeddings using Ollama nomic-embed-text model
    - Implement app/services/vector_store.py for ChromaDB operations (store, search)
    - _Requirements: 17.4, 17.5_

- [x] 16. Implement document indexing endpoint




  - [x] 16.1 Create index router


    - Implement app/routers/index.py with POST /index endpoint
    - Implement full pipeline: download PDF → extract text → chunk → embed → store in ChromaDB
    - Return success response with chunks_indexed count
    - _Requirements: 3.4, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 17. Implement query processing pipeline




  - [x] 17.1 Create LLM service and query router


    - Implement app/services/llm.py to interact with Ollama for answer generation using llama3.1 or qwen2.5
    - Implement prompt template with system instructions and context
    - Implement app/routers/query.py with POST /query endpoint
    - Implement full pipeline: embed question → similarity search → retrieve top 5 chunks → construct prompt → generate answer
    - Return response with answer and source document references
    - _Requirements: 4.2, 4.3, 4.4, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 18. Create FastAPI app entry point




  - [x] 18.1 Wire routers and start FastAPI server


    - Create app/main.py to configure FastAPI app with routers
    - Implement GET /health endpoint to check Ollama and ChromaDB connectivity
    - Add CORS middleware for backend API access
    - _Requirements: 1.4_

- [x] 19. Set up Admin Dashboard project structure




  - [x] 19.1 Initialize React + TypeScript project with Vite


    - Create admin/package.json with dependencies (react, react-router-dom, axios, typescript, tailwindcss or material-ui)
    - Create admin/tsconfig.json with strict TypeScript configuration
    - Create admin/vite.config.ts for Vite configuration
    - Create admin/src directory structure (components/, pages/, services/, hooks/, context/, utils/, types/)
    - Create admin/.env.example with API base URL
    - _Requirements: 1.2, 19.2_

- [x] 20. Implement authentication context and services




  - [x] 20.1 Create auth context and API service


    - Create context/AuthContext.tsx for global auth state management
    - Create services/api.ts with Axios instance and request/response interceptors
    - Create services/auth.service.ts with login, refresh, and logout API calls
    - Create hooks/useAuth.ts for authentication hook
    - Create hooks/usePermissions.ts for permission checking
    - _Requirements: 11.1_
  
  - [x] 20.2 Create login page and form


    - Create pages/Login.tsx with login page layout
    - Create components/Auth/LoginForm.tsx with email/password form and validation
    - Implement JWT token storage in localStorage
    - Implement redirect to dashboard after successful login
    - _Requirements: 11.1_

- [x] 21. Implement layout and navigation




  - [x] 21.1 Create layout components with role-based navigation


    - Create components/Layout/Layout.tsx as main layout wrapper
    - Create components/Layout/Header.tsx with user info and logout button
    - Create components/Layout/Sidebar.tsx with dynamic navigation based on user permissions
    - Implement navigation items array with permission checks
    - _Requirements: 10.5, 11.2_

- [x] 22. Implement PDF Document Manager




  - [x] 22.1 Create document management pages and components


    - Create services/documents.service.ts with API calls for documents CRUD
    - Create pages/Documents/DocumentList.tsx with table, search, and pagination
    - Create pages/Documents/DocumentUpload.tsx with drag-and-drop file upload
    - Create components/common/FileUpload.tsx reusable upload component
    - Implement PDF preview using PDF.js library
    - Display indexed status indicator
    - _Requirements: 11.3_

- [x] 23. Implement News Manager






  - [x] 23.1 Create news management pages


    - Create services/news.service.ts with API calls for news CRUD
    - Create pages/News/NewsList.tsx with table, search, filter, and pagination
    - Create pages/News/NewsForm.tsx with create/edit form and validation
    - Create pages/News/NewsDetail.tsx for viewing news details
    - Create components/common/RichTextEditor.tsx for content editing
    - Implement image upload for news articles
    - Implement publish/unpublish toggle
    - _Requirements: 11.4_

- [x] 24. Implement Vacancies Manager





  - [x] 24.1 Create vacancies management pages


    - Create services/vacancies.service.ts with API calls for vacancies CRUD
    - Create pages/Vacancies/VacanciesList.tsx with table, search, filter, and pagination
    - Create pages/Vacancies/VacancyForm.tsx with create/edit form
    - Implement optional PDF attachment upload
    - Implement type filtering (full-time, part-time, bursary, internship)
    - _Requirements: 11.5_

- [x] 25. Implement Tenders Manager




  - [x] 25.1 Create tenders management pages


    - Create services/tenders.service.ts with API calls for tenders CRUD
    - Create pages/Tenders/TendersList.tsx with table, search, filter, and pagination
    - Create pages/Tenders/TenderForm.tsx with create/edit form
    - Implement required PDF document upload
    - Implement status filtering (open, closed, upcoming)
    - _Requirements: 11.5_

- [x] 26. Implement Banners Manager




  - [x] 26.1 Create banners management pages


    - Create services/banners.service.ts with API calls for banners CRUD
    - Create pages/Banners/BannersList.tsx with table and order management
    - Create pages/Banners/BannerForm.tsx with create/edit form
    - Implement image upload for banners
    - Implement active/inactive toggle
    - Implement drag-and-drop reordering
    - _Requirements: 11.5_

- [x] 27. Implement Locations Manager




  - [x] 27.1 Create locations management pages


    - Create services/locations.service.ts with API calls for locations CRUD
    - Create pages/Locations/LocationsList.tsx with table and region filtering
    - Create pages/Locations/LocationForm.tsx with create/edit form
    - Implement coordinate input (latitude/longitude)
    - _Requirements: 11.5_

- [x] 28. Implement User Management (super-admin only)




  - [x] 28.1 Create user management pages


    - Create services/users.service.ts with API calls for user management
    - Create pages/Users/UsersList.tsx with table showing all admin users
    - Create pages/Users/UserForm.tsx with create/edit form
    - Implement role selection (super-admin, admin)
    - Implement permission checkboxes for granular access control
    - Apply permission guard to only show for super-admins
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [-] 29. Create reusable UI components


  - [x] 29.1 Build common components



    - Create components/common/DataTable.tsx with sorting, pagination, and search
    - Create components/common/ConfirmDialog.tsx for delete confirmations
    - Implement loading states and error handling in all components
    - _Requirements: 11.2_

- [x] 30. Implement routing and protected routes





  - [x] 30.1 Set up React Router with authentication guards


    - Create App.tsx with React Router configuration
    - Implement protected route wrapper that checks authentication
    - Implement permission-based route guards
    - Configure routes for all pages (login, dashboard, documents, news, vacancies, tenders, banners, locations, users)
    - _Requirements: 11.1, 11.2_

- [x] 31. Integrate existing React Native app into monorepo




  - [x] 31.1 Move existing app into monorepo structure


    - Copy existing React Native app files into app/ directory
    - Update package.json and configuration files
    - Update API base URL configuration to point to new backend
    - _Requirements: 1.3_

- [x] 32. Update mobile app services for new backend





  - [x] 32.1 Update API service files


    - Update services/api.js with new backend base URL
    - Update services/newsService.js to use new endpoints
    - Update services/vacanciesService.js to use new endpoints
    - Update services/tendersService.js to use new endpoints
    - Update services/locationsService.js to use new endpoints
    - Create services/bannersService.js for banner API calls
    - Create services/chatbotService.js for chatbot API calls
    - _Requirements: 12.1, 13.1, 14.1, 15.1_

- [x] 33. Implement banner carousel on Home Screen




  - [x] 33.1 Update HomeScreen with banner display


    - Update screens/HomeScreen.js to fetch banners from GET /api/banners
    - Implement carousel/slider component to display banners
    - Implement banner tap handler to open linked URLs
    - Add loading and error states
    - _Requirements: 8.3_

- [x] 34. Enhance News Screen with search functionality





  - [x] 34.1 Update NewsScreen with search and filtering

    - Update screens/NewsScreen.js to add search input
    - Implement search filtering by title and category
    - Add category filter chips
    - Implement pull-to-refresh functionality
    - Add loading skeleton screens
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [x] 35. Enhance Tenders Screen with download and filtering




  - [x] 35.1 Update TendersScreen with status filtering and download


    - Update screens/TendersScreen.js to add status filter (Open, Closed, Upcoming)
    - Implement search functionality
    - Add download PDF button using react-native-fs or expo-file-system
    - Display reference number, closing date, and value
    - Add status badges
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 36. Enhance Vacancies Screen with filtering





  - [x] 36.1 Update VacanciesScreen with type filtering


    - Update screens/VacanciesScreen.js to add type filter (Full-time, Part-time, Bursaries, Internships)
    - Implement expandable cards for vacancy details
    - Implement search functionality
    - Display requirements, responsibilities, and closing date
    - Add optional PDF download for application forms
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 37. Enhance Locations Screen with maps integration




  - [x] 37.1 Update LocationsScreen with region filtering and maps


    - Update screens/LocationsScreen.js to add region filter dropdown
    - Group locations by region
    - Implement tap handler to open address in device maps app (Google Maps/Apple Maps)
    - Display office name, address, and contact info
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 38. Implement Chatbot Screen




  - [x] 38.1 Create new ChatbotScreen with AI chat interface


    - Create screens/ChatbotScreen.js with chat UI
    - Implement message bubbles for user and AI messages
    - Create text input with send button
    - Display user messages immediately in chat history
    - Show loading indicator while waiting for AI response
    - Display AI responses with source document links
    - Implement tap handler for source links to view document details
    - Implement persistent chat history using AsyncStorage
    - Add ChatbotScreen to navigation
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [-] 39. Update mobile app navigation


  - [ ] 39.1 Add chatbot to navigation menu


    - Update navigation configuration to include Chatbot screen
    - Add chatbot icon to tab bar or drawer menu
    - _Requirements: 16.1_

- [x] 40. Write backend API tests













  - [x] 40.1 Create unit tests for services and utilities




    - Write tests for auth service (login, token generation, refresh)
    - Write tests for all module services (news, vacancies, tenders, etc.)
    - Write tests for validators and utility functions
    - Write tests for middleware (auth, roleGuard, errorHandler)
    - Target 80% code coverage
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 6.1, 7.1, 8.1, 9.1_
  
  - [x] 40.2 Create integration tests for API endpoints


    - Write tests for authentication flow with test database
    - Write tests for all CRUD endpoints with MongoDB Memory Server
    - Write tests for file upload with mock Cloudinary
    - Write tests for RAG service integration with mock HTTP client
    - _Requirements: 3.1, 3.3, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 41. Write admin dashboard tests




  - [x] 41.1 Create component and integration tests


    - Write unit tests for all components
    - Write tests for hooks (useAuth, usePermissions, useApi)
    - Write tests for service functions
    - Write integration tests for user flows (login, create content, logout)
    - Write tests for form validation
    - Write API integration tests with MSW (Mock Service Worker)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [-] 42. Write RAG service tests


  - [x] 42.1 Create unit and integration tests



    - Write unit tests for PDF processing functions
    - Write unit tests for text chunking logic
    - Write unit tests for embedding generation with mock Ollama
    - Write integration tests for full indexing pipeline with test PDFs
    - Write integration tests for query pipeline with test vector database
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 43. Write mobile app tests




  - [x] 43.1 Create component and integration tests



    - Write unit tests for all components
    - Write unit tests for service functions
    - Write integration tests for navigation flows
    - Write integration tests for API calls with mock responses
    - _Requirements: 12.1, 13.1, 14.1, 15.1, 16.1_
