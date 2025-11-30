# Requirements Document

## Introduction

The backend service is unable to communicate with the RAG (Retrieval-Augmented Generation) service due to API endpoint path mismatches. The backend is calling endpoints without the `/api` prefix (e.g., `/index`, `/query`), while the RAG service has these endpoints mounted under the `/api` prefix (e.g., `/api/index`, `/api/query`). This causes 404 errors when attempting to index documents or query the RAG service.

## Glossary

- **Backend Service**: The Node.js/TypeScript backend API that manages the Roads Authority application
- **RAG Service**: The Python FastAPI service that handles document indexing and chatbot queries using Retrieval-Augmented Generation
- **HTTP Client**: The axios-based client in the backend that makes requests to the RAG service
- **Router Prefix**: The URL path prefix applied to a group of API endpoints in FastAPI
- **Endpoint Path**: The complete URL path used to access an API endpoint

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to upload documents to the RAG service, so that they can be indexed and used for chatbot queries.

#### Acceptance Criteria

1. WHEN the backend calls the RAG indexing endpoint THEN the RAG service SHALL receive the request at the correct URL path
2. WHEN a document is successfully indexed THEN the backend SHALL receive a success response with the number of chunks indexed
3. WHEN indexing fails THEN the backend SHALL receive an appropriate error response with details
4. WHEN the backend checks indexing progress THEN the RAG service SHALL return the current progress status

### Requirement 2

**User Story:** As a system administrator, I want the backend to query the RAG service, so that chatbot functionality works correctly.

#### Acceptance Criteria

1. WHEN the backend sends a query to the RAG service THEN the RAG service SHALL receive the request at the correct URL path
2. WHEN a query is successful THEN the backend SHALL receive relevant document chunks and a generated answer
3. WHEN a query fails THEN the backend SHALL receive an appropriate error response

### Requirement 3

**User Story:** As a system administrator, I want to monitor the health of the RAG service, so that I can ensure it is operational.

#### Acceptance Criteria

1. WHEN the backend performs a health check THEN the RAG service SHALL respond with connectivity status
2. WHEN the RAG service is healthy THEN the response SHALL indicate successful connections to Ollama and ChromaDB
3. WHEN the RAG service is degraded THEN the response SHALL indicate which services are unavailable

### Requirement 4

**User Story:** As a developer, I want consistent API endpoint paths, so that the system is maintainable and follows REST conventions.

#### Acceptance Criteria

1. WHEN API endpoints are defined THEN the system SHALL use consistent path prefixes across all services
2. WHEN endpoints are documented THEN the documentation SHALL accurately reflect the actual endpoint paths
3. WHEN the backend is configured THEN the base URL SHALL correctly point to the RAG service
