# Design Document

## Overview

This design addresses six bugs identified in the RAG service through automated testing. The bugs span multiple components including text chunking, error handling, test mocking, and service initialization. Each bug will be fixed with minimal changes to ensure existing functionality remains intact while resolving the test failures.

## Architecture

The RAG service follows a layered architecture:

```
Routers (index.py, query.py)
    ↓
Services (pdf_processor.py, embeddings.py, vector_store.py, llm.py)
    ↓
Utils (chunking.py)
```

The bugs affect different layers:
- **Utils layer**: Chunking overlap logic
- **Services layer**: Error handling, initialization
- **Tests layer**: Mocking and assertions

## Components and Interfaces

### 1. Text Chunker (app/utils/chunking.py)

**Current Issue**: The `create_chunks` method doesn't properly handle overlap when creating chunks, resulting in fewer chunks than expected.

**Fix Approach**:
- Review the overlap logic in the chunking algorithm
- Ensure that when text exceeds chunk_size + chunk_overlap, multiple chunks are created
- Verify that overlap content from the previous chunk is included in the next chunk

**Interface** (unchanged):
```python
def create_chunks(
    text: str,
    metadata: Dict[str, Any] = None
) -> List[Dict[str, Any]]
```

### 2. PDF Processor (app/services/pdf_processor.py)

**Current Issue**: The error message format in `download_pdf` doesn't match the expected format in tests.

**Fix Approach**:
- Ensure the PDFProcessingError message starts with "Failed to download PDF"
- Include retry count and underlying error details
- Match the exact format expected by error handling code

**Interface** (unchanged):
```python
def download_pdf(url: str) -> bytes
```

### 3. Embedding Service Tests (tests/test_integration_query.py)

**Current Issue**: Mock returns a MagicMock object instead of a proper list of floats for embeddings.

**Fix Approach**:
- Update the mock configuration to return a proper list of 768 floats
- Ensure `client.embeddings().get()` returns the embedding list directly
- Use `return_value` instead of chained mocks

**Test Fix**:
```python
# Before: mock_client.embeddings.return_value.get.return_value = mock_embedding
# After: mock_client.embeddings.return_value = {'embedding': [0.1] * 768}
```

### 4. Query Error Handling Tests (tests/test_integration_query.py)

**Current Issue**: The test expects an exception to be raised but the code doesn't raise one.

**Fix Approach**:
- Review the embedding service error handling in query pipeline
- Ensure EmbeddingError is properly raised and not caught silently
- Update test to match actual error handling behavior or fix the code to raise exceptions

### 5. LLM Service Tests (tests/test_llm.py)

**Current Issue**: Test expects model name "llama3.1" but config has "llama3.1:8b".

**Fix Approach**:
- Update test assertion to check if base model name is contained in the full model name
- Accept both "llama3.1" and "llama3.1:8b" as valid
- Use substring matching instead of exact list membership

**Test Fix**:
```python
# Before: assert service.model in ['llama3.1', 'qwen2.5']
# After: assert any(model in service.model for model in ['llama3.1', 'qwen2.5'])
```

### 6. Vector Store Initialization (app/services/vector_store.py)

**Current Issue**: VectorStore raises an exception during initialization when connection fails, preventing graceful degradation.

**Fix Approach**:
- Wrap collection initialization in try-except
- Allow VectorStore to initialize even if collection creation fails
- Set collection to None and handle None checks in methods
- Let check_connection() method report the actual connection status

**Modified Interface**:
```python
def __init__(self, collection_name: str = None):
    # Initialize client
    # Try to get collection, but don't fail if it doesn't work
    # Store collection as None if initialization fails
```

## Data Models

No changes to data models are required. All fixes are in logic and error handling.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chunking creates multiple chunks for long text

*For any* text with token count greater than chunk_size, the chunking function should produce at least 2 chunks when overlap is enabled
**Validates: Requirements 1.1**

### Property 2: Consecutive chunks have overlapping content

*For any* pair of consecutive chunks (chunk N and chunk N+1), there should be overlapping text content between the end of chunk N and the beginning of chunk N+1
**Validates: Requirements 1.3**

### Property 3: PDF download error messages include required information

*For any* PDF download failure after all retries, the raised PDFProcessingError message should start with "Failed to download PDF", include the retry count, and include the underlying error details
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: Embedding failures raise exceptions

*For any* embedding generation failure during query processing, the service should raise an EmbeddingError or HTTPException with appropriate error details
**Validates: Requirements 4.1**

### Property 5: Model names with version tags are supported

*For any* LLM model name that contains a valid base model identifier (llama3.1, qwen2.5), the service should accept it regardless of whether it includes a version tag (e.g., ":8b", ":7b")
**Validates: Requirements 5.3**

### Property 6: VectorStore initialization handles connection failures gracefully

*For any* VectorStore initialization attempt, if ChromaDB connection fails, the initialization should complete without raising an exception, and the check_connection() method should return False
**Validates: Requirements 6.1**

## Error Handling

### Chunking Errors
- Maintain existing error handling
- Ensure overlap logic doesn't cause infinite loops or empty chunks

### PDF Processing Errors
- Update error message format to match expected pattern
- Preserve all error details for debugging

### Service Initialization Errors
- Catch exceptions during VectorStore collection initialization
- Log errors but don't fail initialization
- Return False from check_connection() when collection is None

### Test Mocking Errors
- Fix mock configurations to return proper types
- Ensure mocks simulate real service behavior accurately

## Testing Strategy

### Unit Tests

All existing unit tests should continue to pass. Specific fixes:

1. **test_create_chunks_overlap**: Should pass after fixing chunking logic
2. **test_pipeline_error_handling_pdf_download**: Should pass after fixing error message format
3. **test_full_query_pipeline**: Should pass after fixing mock configuration
4. **test_query_error_handling_embedding_failure**: Should pass after fixing error handling or test expectations
5. **test_initialization_default**: Should pass after updating assertion logic
6. **test_check_connection_failure**: Should pass after fixing VectorStore initialization

### Integration Tests

All integration tests should continue to pass. The fixes should not break any existing functionality.

### Manual Testing

After fixes:
1. Start the RAG service
2. Verify health check endpoint returns proper status
3. Test document indexing with a real PDF
4. Test query processing with indexed documents
5. Verify error handling with invalid inputs

## Implementation Notes

### Priority Order

1. **Fix test mocks first** (Requirements 3, 4, 5) - These are test-only changes
2. **Fix error message format** (Requirement 2) - Simple string change
3. **Fix VectorStore initialization** (Requirement 6) - Important for service stability
4. **Fix chunking overlap** (Requirement 1) - Most complex logic change

### Backward Compatibility

All fixes maintain backward compatibility:
- API interfaces unchanged
- Response formats unchanged
- Configuration unchanged
- Only internal logic and error handling improved

### Risk Mitigation

- Run full test suite after each fix
- Test with real Ollama and ChromaDB instances
- Verify health check endpoint behavior
- Test error scenarios manually

## Performance Considerations

No performance impact expected. All fixes are in error handling, initialization, and test code.

## Dependencies

No new dependencies required. All fixes use existing libraries and frameworks.

## Deployment

No special deployment steps required. Standard deployment process:
1. Apply code changes
2. Run tests to verify
3. Restart service
4. Verify health check

## Future Enhancements

After fixing these bugs:
1. Add more comprehensive error handling tests
2. Improve chunking algorithm for better context preservation
3. Add retry logic for ChromaDB connection failures
4. Implement circuit breaker pattern for external service calls
