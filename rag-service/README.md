# RAG Service

Python + FastAPI microservice for Retrieval-Augmented Generation using Ollama.

## Status

✅ **Core Implementation Complete** - FastAPI app, routers, and services are implemented and functional.

## Overview

This RAG (Retrieval-Augmented Generation) service provides:
- PDF document processing and text extraction
- Document chunking and embedding generation
- Vector storage with ChromaDB
- Semantic search for relevant document chunks
- AI-powered answer generation using Ollama
- Source attribution for transparency

## Tech Stack

- **Framework:** FastAPI
- **Language:** Python 3.10+
- **LLM Runtime:** Ollama
- **Vector Database:** ChromaDB
- **PDF Processing:** PyPDF2 or pdfplumber
- **HTTP Client:** httpx
- **Testing:** pytest + pytest-asyncio

## Setup

### Prerequisites

1. **Python 3.10+** installed
2. **Ollama** installed and running ([download](https://ollama.com/download))
3. **Required Ollama models** pulled:
   ```bash
   ollama pull nomic-embed-text
   ollama pull llama3.1:8b
   ```

### Installation

1. Navigate to the rag-service directory:
   ```bash
   cd rag-service
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

5. Start the service:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

   Or run directly:
   ```bash
   python app/main.py
   ```

6. Access the API documentation:
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc
   - Health Check: http://localhost:8001/health

See the [root README](../README-MONOREPO.md) for complete setup instructions.

## Project Structure

```
rag-service/
├── app/
│   ├── main.py                   # FastAPI app entry
│   ├── config.py                 # Configuration
│   ├── models/
│   │   ├── schemas.py           # Pydantic models
│   │   └── document.py          # Document data model
│   ├── services/
│   │   ├── pdf_processor.py    # PDF text extraction
│   │   ├── embeddings.py       # Embedding generation
│   │   ├── vector_store.py     # ChromaDB operations
│   │   └── llm.py              # Ollama LLM interaction
│   ├── routers/
│   │   ├── index.py            # Document indexing endpoint
│   │   └── query.py            # Query processing endpoint
│   └── utils/
│       ├── chunking.py         # Text chunking
│       └── logger.py           # Logging configuration
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Ollama Models

This service requires the following Ollama models:

### Embedding Model
- **nomic-embed-text** - 768-dimensional embeddings optimized for retrieval
- Pull: `ollama pull nomic-embed-text`

### LLM Models (choose one)
- **llama3.1:8b** - Meta's Llama 3.1 (8B parameters)
  - Pull: `ollama pull llama3.1:8b`
- **qwen2.5:7b** - Alibaba's Qwen 2.5 (7B parameters)
  - Pull: `ollama pull qwen2.5:7b`

## API Endpoints

### POST /index
Index a PDF document for chatbot knowledge base.

**Request:**
```json
{
  "document_url": "https://example.com/document.pdf",
  "document_id": "doc_123",
  "title": "Document Title"
}
```

**Response:**
```json
{
  "status": "success",
  "chunks_indexed": 42,
  "document_id": "doc_123"
}
```

### POST /query
Query the knowledge base and get AI-generated answers.

**Request:**
```json
{
  "question": "What are the requirements for road construction permits?",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Based on the official documents...",
  "sources": [
    {
      "document_id": "doc_123",
      "title": "Road Construction Guidelines",
      "relevance": 0.89,
      "chunk_text": "..."
    }
  ],
  "confidence": 0.85
}
```

### GET /health
Check service health and connectivity.

**Response:**
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true,
  "models_available": ["nomic-embed-text", "llama3.1:8b"]
}
```

## Document Processing Pipeline

1. **Download PDF** - Fetch document from provided URL
2. **Extract Text** - Parse PDF and extract text content
3. **Chunk Text** - Split into 500-token chunks with 50-token overlap
4. **Generate Embeddings** - Create vector embeddings using Ollama
5. **Store Vectors** - Save to ChromaDB with metadata
6. **Return Status** - Confirm successful indexing

## Query Processing Pipeline

1. **Embed Question** - Generate embedding for user query
2. **Similarity Search** - Find top K most relevant chunks
3. **Retrieve Context** - Get chunk text and metadata
4. **Construct Prompt** - Build prompt with context and question
5. **Generate Answer** - Use Ollama LLM to generate response
6. **Format Response** - Return answer with source attribution

## Configuration

### Environment Variables

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.1:8b

# ChromaDB Configuration
CHROMADB_PATH=./data/chromadb
CHROMADB_HOST=localhost
CHROMADB_PORT=8001

# RAG Configuration
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K_RESULTS=5

# Logging
LOG_LEVEL=INFO
```

## Chunking Strategy

- **Chunk Size:** 500 tokens (~375 words)
- **Overlap:** 50 tokens (~37 words)
- **Rationale:** Balances context completeness with retrieval granularity

Overlapping chunks ensure important context isn't lost at boundaries.

## Prompt Template

```
You are a helpful assistant for Roads Authority Namibia. 
Answer the question based on the provided context from official documents. 
If the answer is not in the context, say so clearly.

Context:
{retrieved_chunks}

Question: {user_question}

Answer:
```

## Performance Considerations

- **Embedding Generation:** ~100ms per chunk
- **Vector Search:** ~50ms for top-5 retrieval
- **LLM Generation:** 2-5 seconds depending on model and response length
- **Total Query Time:** 3-6 seconds typical

## Implementation Status

- ✅ Initialize Python FastAPI project
- ✅ Implement PDF processing pipeline
- ✅ Set up ChromaDB vector storage
- ✅ Implement embedding generation with Ollama
- ✅ Create indexing endpoint
- ✅ Implement query processing pipeline
- ✅ Create query endpoint
- ✅ Add health check endpoint
- ⏳ Add comprehensive tests (in progress)

Refer to the implementation tasks in `.kiro/specs/full-stack-monorepo/tasks.md`

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL is correct
- Verify models are pulled

### ChromaDB Issues
- Check CHROMADB_PATH permissions
- Ensure sufficient disk space
- Verify ChromaDB is initialized

### PDF Processing Issues
- Verify PDF is not password-protected
- Check PDF is not corrupted
- Ensure sufficient memory for large PDFs

## Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_pdf_processor.py
```
