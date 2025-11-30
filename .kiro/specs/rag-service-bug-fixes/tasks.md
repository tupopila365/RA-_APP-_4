# Implementation Plan

- [x] 1. Fix test mocking issues









  - [x] 1.1 Fix query pipeline embedding mock to return proper list




    - Update tests/test_integration_query.py test_full_query_pipeline
    - Change mock_client.embeddings return value to return {'embedding': [0.1] * 768}
    - Ensure the mock returns a list of floats, not a MagicMock object
    - Run test to verify it passes
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 1.2 Fix LLM service model name test assertion




    - Update tests/test_llm.py test_initialization_default
    - Change assertion from `assert service.model in ['llama3.1', 'qwen2.5']`
    - To `assert any(model in service.model for model in ['llama3.1', 'qwen2.5'])`
    - This accepts both "llama3.1" and "llama3.1:8b" as valid
    - Run test to verify it passes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 1.3 Fix query error handling test expectations




    - Update tests/test_integration_query.py test_query_error_handling_embedding_failure
    - Review the actual error handling behavior in the query router
    - Either fix the test to match actual behavior or update code to raise exceptions
    - Ensure embedding failures are properly caught and re-raised as HTTPException
    - Run test to verify it passes
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Fix PDF download error message format












  - [x] 2.1 Update PDFProcessingError message in download_pdf method




    - Open app/services/pdf_processor.py
    - Locate the download_pdf method where PDFProcessingError is raised
    - Update error message to: `f"Failed to download PDF after {self.max_retries} attempts: {str(last_error)}"`
    - Ensure message starts with "Failed to download PDF"
    - Includes retry count and underlying error
    - Run test_pipeline_error_handling_pdf_download to verify
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Fix VectorStore initialization error handling









  - [x] 3.1 Make VectorStore initialization handle connection failures gracefully




    - Open app/services/vector_store.py
    - Modify __init__ method to wrap collection initialization in try-except
    - Set self.collection = None if initialization fails
    - Log the error but don't raise exception
    - Update check_connection method to return False if self.collection is None
    - Update other methods to check if self.collection is None before using it
    - Run test_check_connection_failure to verify
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Fix text chunking overlap logic













  - [x] 4.1 Fix create_chunks method to properly handle overlap




    - Open app/utils/chunking.py
    - Review the create_chunks method overlap logic
    - Ensure that when text length > chunk_size, multiple chunks are created
    - Verify overlap content from previous chunk is included in next chunk
    - Test with text of 150 tokens, chunk_size=100, overlap=50 should create 2+ chunks
    - Run test_create_chunks_overlap to verify
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Run full test suite and verify all tests pass




  - [ ] 5.1 Execute complete test suite


    - Run `pytest tests/ -v` from rag-service directory
    - Verify all 103 tests pass without failures
    - Check that no new test failures were introduced
    - Review test output for any warnings or issues
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Manual testing and verification




  - [ ] 6.1 Test RAG service with real dependencies


    - Start Ollama service
    - Start RAG service with `python app/main.py`
    - Check health endpoint returns proper status
    - Test document indexing with a sample PDF
    - Test query processing with indexed documents
    - Verify error handling with invalid inputs
    - Confirm all functionality works as expected
    - _Requirements: 7.1, 7.2, 7.3_
