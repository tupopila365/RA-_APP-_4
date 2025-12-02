# PDF Processing Pipeline Implementation

## Overview

This document describes the implementation of the PDF processing pipeline for the RAG (Retrieval-Augmented Generation) service. The pipeline enables the system to process PDF documents, extract text, create searchable chunks, generate embeddings, and store them in a vector database.

## Components Implemented

### 1. PDF Processor (`app/services/pdf_processor.py`)

**Purpose**: Download PDF documents from URLs and extract text content.

**Key Features**:
- Downloads PDFs from URLs with retry logic (3 attempts with exponential backoff)
- Extracts text from PDFs using PyPDF2
- Handles multi-page documents
- Provides page-by-page text extraction
- Robust error handling with custom exceptions

**Main Methods**:
- `download_pdf(url)`: Downloads PDF with retry logic
- `extract_text_from_pdf(pdf_content)`: Extracts text from PDF bytes
- `process_pdf_from_url(url)`: Complete pipeline from URL to extracted text

**Error Handling**:
- `PDFProcessingError`: Custom exception for all PDF processing failures
- Automatic retry with exponential backoff for network issues
- Graceful handling of corrupted or unreadable PDFs

### 2. Text Chunker (`app/utils/chunking.py`)

**Purpose**: Split extracted text into manageable chunks with overlap for better context preservation.

**Key Features**:
- Configurable chunk size (default: 500 tokens)
- Configurable overlap (default: 50 tokens)
- Sentence-aware splitting to preserve context
- Token estimation using regex-based heuristic
- Handles long sentences by splitting on word boundaries
- Preserves page information in metadata

**Main Methods**:
- `estimate_tokens(text)`: Estimates token count using whitespace/punctuation splitting
- `split_text_by_tokens(text, max_tokens)`: Splits text into segments
- `create_chunks(text, metadata)`: Creates overlapping chunks with metadata
- `chunk_document_pages(page_texts, document_metadata)`: Chunks multi-page documents

**Chunking Strategy**:
1. Split text into sentences
2. Group sentences into chunks up to max token size
3. Handle oversized sentences by word-level splitting
4. Add overlap from previous chunk to maintain context
5. Attach metadata (page number, chunk index, etc.)

### 3. Embedding Service (`app/services/embeddings.py`)

**Purpose**: Generate vector embeddings for text chunks using Ollama.

**Key Features**:
- Uses Ollama's `nomic-embed-text:latest` model (768-dimensional embeddings)
- Batch processing support
- Connection health checks
- Model availability verification
- Graceful error handling for failed embeddings

**Main Methods**:
- `generate_embedding(text)`: Generate embedding for single text
- `generate_embeddings_batch(texts)`: Generate embeddings for multiple texts
- `embed_chunks(chunks)`: Add embeddings to chunk dictionaries
- `check_connection()`: Verify Ollama service is accessible
- `check_model_available()`: Verify embedding model is installed

**Configuration**:
- Base URL: Configurable via `settings.ollama_base_url` (default: http://localhost:11434)
- Model: Configurable via `settings.ollama_embedding_model` (default: nomic-embed-text:latest)

### 4. Vector Store (`app/services/vector_store.py`)

**Purpose**: Store and retrieve document embeddings using ChromaDB.

**Key Features**:
- Persistent storage using ChromaDB
- Efficient similarity search
- Document-level operations (add, delete, retrieve)
- Metadata filtering support
- Connection health checks

**Main Methods**:
- `add_documents(chunks, document_id, document_title)`: Store chunks in vector DB
- `search(query_embedding, top_k, filter_metadata)`: Find similar documents
- `delete_document(document_id)`: Remove all chunks for a document
- `get_document_chunks(document_id)`: Retrieve all chunks for a document
- `count_documents()`: Get total chunk count
- `check_connection()`: Verify ChromaDB is accessible

**Data Structure**:
Each chunk is stored with:
- Unique ID: `{document_id}_chunk_{chunk_index}`
- Embedding: 768-dimensional vector
- Document: Original text content
- Metadata:
  - `document_id`: Source document identifier
  - `document_title`: Document title
  - `chunk_index`: Position in document
  - `total_chunks`: Total chunks in document
  - `page_number`: Source page number
  - `token_count`: Estimated tokens in chunk

## Configuration

All services use settings from `app/config.py`:

```python
# Chunking Configuration
chunk_size: int = 500          # Target tokens per chunk
chunk_overlap: int = 50        # Overlap tokens between chunks

# Ollama Configuration
ollama_base_url: str = "http://localhost:11434"
ollama_embedding_model: str = "nomic-embed-text:latest"

# ChromaDB Configuration
chromadb_collection_name: str = "document_chunks"

# Search Configuration
top_k_results: int = 5         # Number of results to return
```

## Usage Example

### Complete Pipeline

```python
from app.services.pdf_processor import PDFProcessor
from app.utils.chunking import TextChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore

# Initialize services
pdf_processor = PDFProcessor()
chunker = TextChunker(chunk_size=500, chunk_overlap=50)
embedding_service = EmbeddingService()
vector_store = VectorStore()

# Process PDF
pdf_data = pdf_processor.process_pdf_from_url("https://example.com/doc.pdf")

# Create chunks
chunks = chunker.chunk_document_pages(
    pdf_data['page_texts'],
    {'source_url': pdf_data['source_url']}
)

# Generate embeddings
embedded_chunks = embedding_service.embed_chunks(chunks)

# Store in vector database
vector_store.add_documents(
    embedded_chunks,
    document_id="doc_123",
    document_title="Example Document"
)

# Search for similar content
query_embedding = embedding_service.generate_embedding("What is the policy?")
results = vector_store.search(query_embedding, top_k=5)
```

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 17.1
✅ **WHEN the RAG Service receives POST /index with a document URL, THE RAG Service SHALL download the PDF**
- Implemented in `PDFProcessor.download_pdf()` with retry logic

### Requirement 17.2
✅ **THE RAG Service SHALL extract text content from the PDF using a PDF parsing library**
- Implemented in `PDFProcessor.extract_text_from_pdf()` using PyPDF2

### Requirement 17.3
✅ **THE RAG Service SHALL split the text into chunks of appropriate size for embedding**
- Implemented in `TextChunker.create_chunks()` with 500-token chunks and 50-token overlap

### Requirement 17.4
✅ **THE RAG Service SHALL generate embeddings for each chunk using Ollama**
- Implemented in `EmbeddingService.embed_chunks()` using nomic-embed-text:latest model

### Requirement 17.5
✅ **THE RAG Service SHALL store embeddings and metadata in ChromaDB**
- Implemented in `VectorStore.add_documents()` with comprehensive metadata

## Error Handling

All services implement robust error handling:

1. **PDFProcessingError**: Raised for PDF download/extraction failures
2. **EmbeddingError**: Raised for embedding generation failures
3. **VectorStoreError**: Raised for vector database operations failures

Each service logs errors with appropriate severity levels and provides detailed error messages.

## Testing

### Verification Script

Run `verify_implementation.py` to test basic functionality:

```bash
python verify_implementation.py
```

This verifies:
- Text chunking with sample data
- PDF processor initialization
- Service structure and configuration

### Integration Testing

Full integration tests require:
1. Running Ollama service with `nomic-embed-text:latest` model
2. ChromaDB instance (automatically created as persistent client)
3. Actual PDF documents for testing

## Performance Considerations

1. **Chunking**: Sentence-aware splitting preserves context while maintaining target size
2. **Overlap**: 50-token overlap ensures context isn't lost at boundaries
3. **Batch Processing**: Embedding service supports batch operations for efficiency
4. **Persistent Storage**: ChromaDB uses persistent client for data durability
5. **Retry Logic**: Exponential backoff prevents overwhelming services during failures

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Chunking**: Implement semantic chunking based on topic boundaries
2. **Parallel Processing**: Process multiple PDFs concurrently
3. **Caching**: Cache embeddings for frequently accessed chunks
4. **Monitoring**: Add metrics for processing time, success rates, etc.
5. **Alternative Models**: Support for different embedding models
6. **OCR Support**: Handle scanned PDFs with image-based text

## Dependencies

- `PyPDF2==3.0.1`: PDF text extraction
- `ollama==0.1.6`: Ollama client for embeddings
- `chromadb==0.4.22`: Vector database
- `requests==2.31.0`: HTTP client for downloads

## Conclusion

The PDF processing pipeline is fully implemented and ready for integration with the indexing and query endpoints. All components follow best practices for error handling, logging, and configuration management.
