# Query Processing Pipeline Implementation

## Overview

This document describes the implementation of the query processing pipeline for the RAG (Retrieval-Augmented Generation) service. The implementation fulfills task 17.1 from the full-stack-monorepo specification.

## Components Implemented

### 1. LLM Service (`app/services/llm.py`)

The LLM service handles answer generation using Ollama's language models.

**Key Features:**
- Configurable LLM model (default: `llama3.1:8b`)
- Prompt template with system instructions and context
- Support for both standard and streaming responses
- Connection and model availability checks
- Comprehensive error handling

**Main Methods:**
- `generate_answer()`: Generate answer from question and context chunks
- `generate_answer_streaming()`: Generate answer with streaming response
- `_build_prompt()`: Build formatted prompt with system instructions, context, and question
- `check_connection()`: Verify Ollama service connectivity
- `check_model_available()`: Check if configured model is available

**Prompt Template:**
```
You are a helpful assistant for Roads Authority Namibia. 
Answer the question based on the provided context from official documents. 
If the answer is not in the context, say so clearly. 
Be concise and accurate in your responses.

Context:
[Source 1: Document Title]
{chunk text}

[Source 2: Document Title]
{chunk text}

Question: {user question}

Answer:
```

### 2. Query Router (`app/routers/query.py`)

The query router implements the POST /query endpoint with the complete RAG pipeline.

**Pipeline Steps:**

1. **Embed Question**: Generate embedding vector for user's question using Ollama
2. **Similarity Search**: Find top K most relevant chunks in ChromaDB
3. **Retrieve Context**: Get document chunks with metadata
4. **Generate Answer**: Use LLM to generate answer from context
5. **Format Response**: Return answer with source document references

**Endpoint Details:**
- **Path**: `POST /query`
- **Request Body**: `QueryRequest` (question, optional top_k)
- **Response**: `QueryResponse` (answer, sources, confidence, timestamp)
- **Error Handling**: Comprehensive error responses for all failure scenarios

**Error Codes:**
- `EMBEDDING_ERROR`: Failed to generate question embedding
- `VECTOR_STORE_ERROR`: Failed to search vector store
- `LLM_ERROR`: Failed to generate answer
- `INTERNAL_ERROR`: Unexpected error

### 3. Schema Models (Updated)

The following Pydantic models support the query pipeline:

- `QueryRequest`: User question and retrieval parameters
- `QueryResponse`: Generated answer with sources and confidence
- `SourceDocument`: Reference to source document with relevance score

## Requirements Validation

### Requirement 4.2 ✅
**"WHEN the RAG Service receives a query, THE RAG Service SHALL retrieve relevant document chunks"**

Implemented in `query_documents()` function:
- Generates embedding for question
- Performs similarity search in ChromaDB
- Retrieves top K relevant chunks (default: 5)

### Requirement 4.3 ✅
**"WHEN relevant chunks are found, THE RAG Service SHALL generate an answer using Ollama"**

Implemented in `LLMService.generate_answer()`:
- Constructs prompt with retrieved context
- Calls Ollama LLM (llama3.1:8b or qwen2.5)
- Returns generated answer

### Requirement 4.4 ✅
**"THE RAG Service SHALL return the answer with source document references"**

Implemented in response formatting:
- Extracts unique source documents from search results
- Includes document ID, title, relevance score, and chunk index
- Returns structured `SourceDocument` objects

### Requirement 18.1 ✅
**"WHEN the RAG Service receives POST /query with a question, THE RAG Service SHALL generate an embedding for the question"**

Implemented using `EmbeddingService.generate_embedding()`:
- Uses Ollama's nomic-embed-text model
- Generates 768-dimensional embedding vector

### Requirement 18.2 ✅
**"THE RAG Service SHALL perform similarity search in the vector database to find relevant chunks"**

Implemented using `VectorStore.search()`:
- Performs cosine similarity search in ChromaDB
- Returns results sorted by relevance

### Requirement 18.3 ✅
**"THE RAG Service SHALL retrieve the top 5 most relevant document chunks"**

Implemented with configurable `top_k` parameter:
- Default: 5 chunks
- Configurable via request (1-10 range)
- Validated by Pydantic schema

### Requirement 18.4 ✅
**"THE RAG Service SHALL construct a prompt with the question and retrieved context"**

Implemented in `LLMService._build_prompt()`:
- System instructions for Roads Authority context
- Formatted context with source attribution
- User question
- Clear structure for LLM processing

### Requirement 18.5 ✅
**"THE RAG Service SHALL generate an answer using llama3.1 or qwen2.5 model via Ollama"**

Implemented with configurable model:
- Default: `llama3.1:8b`
- Configurable via environment variable
- Uses Ollama client for generation

## Configuration

The query pipeline uses the following configuration from `app/config.py`:

```python
ollama_base_url: str = "http://localhost:11434"
ollama_embedding_model: str = "nomic-embed-text"
ollama_llm_model: str = "llama3.1:8b"
top_k_results: int = 5
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Empty Question**: Returns 400 Bad Request
2. **Embedding Failure**: Returns 503 Service Unavailable
3. **Vector Store Failure**: Returns 500 Internal Server Error
4. **LLM Failure**: Returns 503 Service Unavailable
5. **No Results Found**: Returns helpful message indicating no relevant information

## Response Format

### Success Response
```json
{
  "answer": "Generated answer text...",
  "sources": [
    {
      "document_id": "doc_123",
      "title": "Document Title",
      "relevance": 0.92,
      "chunk_index": 5
    }
  ],
  "confidence": 0.88,
  "timestamp": "2025-11-21T09:00:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "LLM_ERROR",
  "message": "Failed to generate answer: Connection timeout"
}
```

## Testing

Comprehensive tests have been implemented in `test_query_router.py`:

1. **LLM Service Tests**: Initialization, prompt building, error handling
2. **Router Structure Tests**: Endpoint configuration, routes, tags
3. **Request Validation Tests**: Schema validation, defaults, constraints
4. **Pipeline Integration Tests**: Service initialization, configuration
5. **Error Handling Tests**: Custom exceptions, error propagation

All tests pass successfully ✅

## Usage Example

### Request
```bash
curl -X POST http://localhost:8001/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the requirements for a driver'\''s license?",
    "top_k": 5
  }'
```

### Response
```json
{
  "answer": "To obtain a driver's license in Namibia, you must meet the following requirements: be at least 18 years old, pass a written test, complete a practical driving test, and provide proof of identity and residence.",
  "sources": [
    {
      "document_id": "doc_license_2024",
      "title": "Driver's License Requirements 2024",
      "relevance": 0.95,
      "chunk_index": 3
    }
  ],
  "confidence": 0.92,
  "timestamp": "2025-11-21T09:52:00Z"
}
```

## Next Steps

To complete the RAG service implementation (Task 18), the following is needed:

1. Create `app/main.py` with FastAPI app configuration
2. Wire the query router into the main app
3. Add CORS middleware for backend API access
4. Implement GET /health endpoint
5. Configure logging and error handling

## Dependencies

The query pipeline relies on:
- `ollama==0.1.6`: LLM and embedding generation
- `chromadb==0.4.22`: Vector storage and similarity search
- `fastapi==0.109.0`: API framework
- `pydantic==2.5.3`: Request/response validation

## Performance Considerations

- **Embedding Generation**: ~100-500ms per query
- **Vector Search**: ~10-50ms for 1000s of chunks
- **LLM Generation**: ~2-10 seconds depending on answer length
- **Total Pipeline**: ~3-15 seconds per query

## Security Considerations

- No authentication required (as per requirements - mobile users access without auth)
- Input validation via Pydantic schemas
- Error messages don't expose internal details
- Rate limiting should be implemented at API gateway level
