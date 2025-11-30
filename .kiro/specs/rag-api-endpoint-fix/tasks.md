# Implementation Plan

- [x] 1. Update backend HTTP client endpoint paths





  - Modify the `ragService` object in `backend/src/utils/httpClient.ts`
  - Update `indexDocument` method to call `/api/index` instead of `/index`
  - Update `queryDocuments` method to call `/api/query` instead of `/query`
  - Update `getIndexingProgress` method to call `/api/index/progress/${documentId}` instead of `/index/progress/${documentId}`
  - Keep `healthCheck` method unchanged (already correct at `/health`)
  - _Requirements: 1.1, 2.1, 4.1_

- [ ]* 1.1 Write unit tests for HTTP client endpoint paths
  - Test that `indexDocument` constructs the correct URL path
  - Test that `queryDocuments` constructs the correct URL path
  - Test that `getIndexingProgress` constructs the correct URL path
  - Test that `healthCheck` uses the correct URL path
  - Mock axios responses to verify path construction
  - _Requirements: 1.1, 2.1, 3.1, 4.2_

- [ ] 2. Verify RAG service is running and accessible




  - Ensure RAG service is started on port 8001
  - Verify Ollama service is running
  - Verify ChromaDB is accessible
  - Check that embedding and LLM models are pulled
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Test document indexing end-to-end





  - Start both backend and RAG services
  - Upload a test PDF document through the admin interface
  - Verify the document is successfully indexed
  - Check backend logs for successful RAG service calls (no 404 errors)
  - Verify indexing progress endpoint returns correct status
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. Test chatbot query functionality




  - Send a test query through the chatbot interface
  - Verify the query reaches the RAG service successfully
  - Verify the response contains relevant document chunks
  - Verify the response contains a generated answer
  - Check that no 404 errors occur
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Test health check endpoint
  - Call the health check endpoint from the backend
  - Verify response indicates Ollama connectivity status
  - Verify response indicates ChromaDB connectivity status
  - Verify overall health status is correct
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 5.1 Write integration tests for RAG service communication
  - Test document indexing flow with real RAG service
  - Test query flow with real RAG service
  - Test health check with real RAG service
  - Test error handling for various failure scenarios
  - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.1_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
