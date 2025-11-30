# Design Document

## Overview

This design addresses the API endpoint path mismatch between the backend service and the RAG service. The issue stems from the RAG service mounting its routers under the `/api` prefix in FastAPI, while the backend HTTP client calls endpoints without this prefix. We will fix this by updating the backend HTTP client to include the `/api` prefix in all RAG service calls.

## Architecture

The system consists of two services communicating via HTTP:

```
Backend Service (Node.js/TypeScript)
    ↓ HTTP Requests
    ↓ (axios client)
    ↓
RAG Service (Python/FastAPI)
    ↓ Endpoints mounted at /api/*
    ↓
    ├── /api/index (POST)
    ├── /api/index/progress/{id} (GET)
    ├── /api/query (POST)
    ├── /api/models (GET)
    └── /health (GET) - not under /api
```

### Current State

**Backend HTTP Client** (`backend/src/utils/httpClient.ts`):
- Calls `/index` → Should be `/api/index`
- Calls `/query` → Should be `/api/query`
- Calls `/index/progress/{id}` → Should be `/api/index/progress/{id}`
- Calls `/health` → Correct (not under `/api`)

**RAG Service** (`rag-service/app/main.py`):
- Mounts index router at `/api` prefix
- Mounts query router at `/api` prefix
- Mounts models router at `/api` prefix
- Health endpoint at `/health` (no prefix)

## Components and Interfaces

### Backend HTTP Client

**File**: `backend/src/utils/httpClient.ts`

**Current Interface**:
```typescript
export const ragService = {
  indexDocument(documentUrl, documentId, title): Promise<any>
  queryDocuments(question, topK): Promise<any>
  healthCheck(): Promise<any>
  getIndexingProgress(documentId): Promise<any>
}
```

**Changes Required**:
- Update `indexDocument` to call `/api/index` instead of `/index`
- Update `queryDocuments` to call `/api/query` instead of `/query`
- Update `getIndexingProgress` to call `/api/index/progress/{id}` instead of `/index/progress/{id}`
- Keep `healthCheck` calling `/health` (no change needed)

### RAG Service Routers

**File**: `rag-service/app/main.py`

**Current Configuration**:
```python
app.include_router(index.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(models.router, prefix="/api")
```

**No changes required** - the RAG service configuration is correct.

## Data Models

No data model changes required. The request/response schemas remain the same:

**IndexRequest**:
```typescript
{
  document_url: string
  document_id: string
  title: string
}
```

**IndexResponse**:
```typescript
{
  status: string
  chunks_indexed: number
  document_id: string
  message: string
}
```

**QueryRequest**:
```typescript
{
  question: string
  top_k: number
}
```

**ProgressResponse**:
```typescript
{
  status: string
  data: {
    status: string
    stage: string
    percentage: number
    message: string
    document_id: string
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Endpoint Path Consistency

*For any* RAG service endpoint call from the backend, the URL path should match the actual endpoint path defined in the RAG service router configuration.

**Validates: Requirements 1.1, 2.1, 4.1**

### Property 2: Successful Request-Response Cycle

*For any* valid request to the RAG service, when the endpoint paths are correctly aligned, the backend should receive a response (either success or error) rather than a 404 Not Found error.

**Validates: Requirements 1.2, 1.3, 2.2, 2.3**

### Property 3: Health Check Independence

*For any* health check request, the endpoint path should remain at `/health` without the `/api` prefix, as it is defined separately from the API routers.

**Validates: Requirements 3.1, 3.2, 3.3**

## Error Handling

### Current Error Handling

The backend HTTP client already has proper error handling:
- Catches axios errors
- Logs errors with details
- Throws structured error objects with status codes and error codes
- Includes error details from RAG service responses

### Expected Behavior After Fix

Once endpoint paths are corrected:
- 404 errors should disappear for valid requests
- Actual RAG service errors (500, 503, etc.) will be properly caught and handled
- Error responses will contain meaningful error details from the RAG service

### Error Scenarios

1. **PDF Processing Error** (400): Invalid PDF or download failure
2. **Embedding Error** (503): Ollama service unavailable or model not found
3. **Vector Store Error** (500): ChromaDB connection or storage failure
4. **Network Error**: Connection timeout or service unreachable

All these errors are already properly handled by the existing error handling code.

## Testing Strategy

### Unit Tests

1. **HTTP Client Path Tests**:
   - Test that `indexDocument` calls the correct path `/api/index`
   - Test that `queryDocuments` calls the correct path `/api/query`
   - Test that `getIndexingProgress` calls the correct path `/api/index/progress/{id}`
   - Test that `healthCheck` calls the correct path `/health`

2. **Mock Response Tests**:
   - Mock successful responses from RAG service
   - Mock error responses (400, 500, 503)
   - Verify error handling and logging

### Integration Tests

1. **End-to-End Document Indexing**:
   - Upload a test document through the backend
   - Verify the request reaches the RAG service
   - Verify successful indexing response
   - Check indexing progress endpoint

2. **End-to-End Query**:
   - Send a query through the backend
   - Verify the request reaches the RAG service
   - Verify response contains answer and chunks

3. **Health Check**:
   - Call health check endpoint
   - Verify response contains Ollama and ChromaDB status

### Manual Testing

1. Start both backend and RAG services
2. Upload a document through the admin interface
3. Verify document is indexed successfully
4. Query the chatbot with a question
5. Verify chatbot returns relevant answers
6. Check backend logs for successful RAG service calls (no 404 errors)

## Implementation Notes

### Minimal Change Approach

The fix requires only updating 3 lines in the backend HTTP client:
- Line ~95: `/index` → `/api/index`
- Line ~108: `/query` → `/api/query`
- Line ~148: `/index/progress/${documentId}` → `/api/index/progress/${documentId}`

No changes to the RAG service are needed.

### Backward Compatibility

This change is not backward compatible with the old endpoint paths, but since the old paths were never working (returning 404), there is no existing functionality to break.

### Configuration

The base URL for the RAG service is already correctly configured in the backend environment variables (`RAG_SERVICE_URL`). No configuration changes are needed.

## Alternative Solutions Considered

### Alternative 1: Remove /api Prefix from RAG Service

**Approach**: Modify the RAG service to remove the `/api` prefix from router mounts.

**Pros**:
- Backend code wouldn't need changes
- Simpler URL structure

**Cons**:
- Violates REST API conventions (versioning and namespacing)
- Would require changes to RAG service code
- Less maintainable for future API versions
- Python/FastAPI convention is to use prefixes

**Decision**: Rejected. It's better to follow REST conventions and keep the `/api` prefix.

### Alternative 2: Use Environment Variable for API Prefix

**Approach**: Make the `/api` prefix configurable via environment variable.

**Pros**:
- More flexible
- Could support different API versions

**Cons**:
- Adds unnecessary complexity
- No current need for this flexibility
- More configuration to manage

**Decision**: Rejected. YAGNI (You Aren't Gonna Need It) - keep it simple.

### Alternative 3: Update Backend Base URL

**Approach**: Change the base URL in the backend to include `/api` (e.g., `http://localhost:8001/api`).

**Pros**:
- Minimal code changes
- Centralized in one place

**Cons**:
- Health check endpoint is at `/health`, not `/api/health`
- Would require special handling for health check
- Less clear what the actual service URL is

**Decision**: Rejected. Better to be explicit in each method call.

## Deployment Considerations

### Deployment Steps

1. Update backend HTTP client code
2. Rebuild backend service
3. Restart backend service
4. Verify RAG service is running
5. Test document upload and indexing
6. Test chatbot queries

### Rollback Plan

If issues occur:
1. Revert the code changes
2. Rebuild and restart backend service
3. Investigate and fix any new issues
4. Redeploy with fixes

### Monitoring

After deployment, monitor:
- Backend logs for RAG service call success/failure
- RAG service logs for incoming requests
- Document indexing success rate
- Chatbot query response times
- Error rates for RAG service calls
