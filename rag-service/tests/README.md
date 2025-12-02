# RAG Service Test Suite

This directory contains comprehensive unit and integration tests for the RAG (Retrieval-Augmented Generation) service.

## Test Structure

```
tests/
├── __init__.py                      # Test package initialization
├── conftest.py                      # Pytest fixtures and configuration
├── test_pdf_processor.py            # Unit tests for PDF processing
├── test_chunking.py                 # Unit tests for text chunking
├── test_embeddings.py               # Unit tests for embedding generation
├── test_vector_store.py             # Unit tests for vector storage
├── test_llm.py                      # Unit tests for LLM service
├── test_integration_indexing.py    # Integration tests for indexing pipeline
└── test_integration_query.py       # Integration tests for query pipeline
```

## Test Coverage

### Unit Tests

#### PDF Processing (`test_pdf_processor.py`)
- PDF download with retry logic
- Text extraction from PDF files
- Error handling for invalid PDFs
- Page structure preservation
- Complete PDF processing pipeline

#### Text Chunking (`test_chunking.py`)
- Token estimation
- Text splitting by tokens
- Chunk creation with metadata
- Chunk overlap functionality
- Document page chunking
- Global chunk indexing

#### Embedding Generation (`test_embeddings.py`)
- Single text embedding
- Batch embedding generation
- Error handling for empty text
- Ollama connection checking
- Model availability verification
- Partial failure handling

#### Vector Store (`test_vector_store.py`)
- Document addition to ChromaDB
- Similarity search
- Document deletion
- Chunk retrieval
- Metadata filtering
- Relevance score calculation

#### LLM Service (`test_llm.py`)
- Prompt building with context
- Answer generation
- Streaming responses
- Temperature and token control
- Error handling
- Model availability checking

### Integration Tests

#### Indexing Pipeline (`test_integration_indexing.py`)
- Complete PDF-to-vector pipeline
- Metadata preservation through pipeline
- Batch embedding processing
- Chunk ID generation
- Error handling at each stage
- Partial failure recovery

#### Query Pipeline (`test_integration_query.py`)
- Complete question-to-answer pipeline
- Relevance ranking
- Top-K result control
- Context assembly for LLM
- Metadata filtering
- Error handling

## Running Tests

### Prerequisites

Install test dependencies:

```bash
pip install pytest pytest-asyncio pytest-mock httpx
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
# Using pytest directly
pytest tests/ -v

# Using the test runner script
python run_tests.py
```

### Run Specific Test Files

```bash
# Unit tests only
pytest tests/test_pdf_processor.py -v
pytest tests/test_chunking.py -v
pytest tests/test_embeddings.py -v
pytest tests/test_vector_store.py -v
pytest tests/test_llm.py -v

# Integration tests only
pytest tests/test_integration_indexing.py -v
pytest tests/test_integration_query.py -v
```

### Run Tests by Marker

```bash
# Run only unit tests (if marked)
pytest tests/ -m unit -v

# Run only integration tests (if marked)
pytest tests/ -m integration -v
```

### Run with Coverage

```bash
pytest tests/ --cov=app --cov-report=html
```

## Test Fixtures

The `conftest.py` file provides shared fixtures:

- `sample_pdf_content`: Sample PDF text for testing
- `sample_page_texts`: Sample page texts from a PDF
- `sample_chunks`: Sample text chunks
- `sample_embedding`: Sample 768-dimensional embedding vector
- `sample_embeddings`: Multiple sample embeddings
- `mock_ollama_client`: Mock Ollama client for testing
- `mock_chromadb_collection`: Mock ChromaDB collection
- `temp_pdf_file`: Temporary PDF file for testing

## Mocking Strategy

Tests use mocking to avoid external dependencies:

- **Ollama API**: Mocked to avoid requiring a running Ollama instance
- **ChromaDB**: Mocked to avoid requiring a database
- **HTTP Requests**: Mocked to avoid network calls
- **File System**: Uses temporary files that are cleaned up

This allows tests to run quickly and reliably without external services.

## Test Requirements Validation

These tests validate the following requirements from the design document:

### Requirement 17 (PDF Processing)
- 17.1: PDF download from URL
- 17.2: Text extraction from PDF
- 17.3: Text chunking with overlap
- 17.4: Embedding generation
- 17.5: Vector storage in ChromaDB

### Requirement 18 (Query Processing)
- 18.1: Question embedding generation
- 18.2: Similarity search
- 18.3: Top-K retrieval
- 18.4: Prompt construction
- 18.5: Answer generation with Ollama

## Key Testing Principles

1. **Isolation**: Each unit test tests a single component in isolation
2. **Mocking**: External dependencies are mocked to ensure reliability
3. **Integration**: Integration tests verify components work together
4. **Error Handling**: Tests verify graceful error handling
5. **Edge Cases**: Tests cover empty inputs, failures, and boundary conditions

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

- No external service dependencies (all mocked)
- Fast execution (< 1 minute for full suite)
- Clear failure messages
- Deterministic results

## Troubleshooting

### Import Errors

If you see import errors, ensure you're running tests from the rag-service directory:

```bash
cd rag-service
pytest tests/
```

### Fixture Not Found

If fixtures are not found, ensure `conftest.py` is in the tests directory.

### Mock Not Working

If mocks aren't being applied, check that the patch path matches the import path in the module being tested.

## Adding New Tests

When adding new functionality:

1. Add unit tests for the new component
2. Add integration tests if it's part of a pipeline
3. Update fixtures in `conftest.py` if needed
4. Update this README with the new test coverage

## Test Metrics

Target metrics:
- **Code Coverage**: > 80%
- **Test Execution Time**: < 60 seconds
- **Test Success Rate**: 100%
- **Flaky Tests**: 0

## Notes

- Tests use mock data and do not require actual Ollama or ChromaDB instances
- PDF processing tests use a minimal valid PDF structure
- Embedding dimensions are set to 768 (matching nomic-embed-text:latest)
- All tests are designed to be deterministic and repeatable
