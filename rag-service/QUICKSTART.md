# RAG Service Quick Start Guide

## Prerequisites

1. **Install Ollama:**
   - Download from https://ollama.com/download
   - Install and start the service

2. **Pull Required Models:**
   ```bash
   ollama pull nomic-embed-text:latest
   ollama pull llama3.2:1b
   ```

3. **Install Python 3.10+:**
   - Verify: `python --version`

## Setup & Run

### 1. Install Dependencies

```bash
cd rag-service
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env` and adjust if needed:
```bash
cp .env.example .env
```

Default configuration works for local development.

### 3. Start the Service

**Option A: Using uvicorn (recommended for development)**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Option B: Direct execution**
```bash
python app/main.py
```

### 4. Verify Service is Running

Open in browser:
- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health

Or use curl:
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true,
  "timestamp": "2025-11-21T09:00:00Z"
}
```

## Testing the Service

### Test Document Indexing

```bash
curl -X POST http://localhost:8001/api/index \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://example.com/document.pdf",
    "document_id": "doc_001",
    "title": "Test Document"
  }'
```

### Test Query

```bash
curl -X POST http://localhost:8001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "top_k": 5
  }'
```

## Troubleshooting

### Ollama Not Connected

**Error:** `"ollama_connected": false`

**Solution:**
1. Check if Ollama is running: `ollama list`
2. If not running, start it: `ollama serve`
3. Verify models are installed: `ollama list`
4. Pull missing models:
   ```bash
   ollama pull nomic-embed-text:latest
   ollama pull llama3.2:1b
   ```

### ChromaDB Issues

**Error:** `"chromadb_connected": false`

**Solution:**
1. Check if `chroma_db` directory exists
2. Verify write permissions
3. Check disk space
4. Try deleting and recreating: `rm -rf chroma_db`

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
Change port in command:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

Or update `.env`:
```env
PORT=8002
```

## API Endpoints

### GET /
Root endpoint with service info

### GET /health
Health check with connectivity status

### POST /api/index
Index a PDF document
- **Body:** `{ "document_url": "...", "document_id": "...", "title": "..." }`
- **Response:** `{ "status": "success", "chunks_indexed": 42, "document_id": "..." }`

### POST /api/query
Query the knowledge base
- **Body:** `{ "question": "...", "top_k": 5 }`
- **Response:** `{ "answer": "...", "sources": [...], "confidence": 0.85 }`

## Development

### Run Tests

```bash
python test_main.py
```

### View Logs

Logs are printed to console. Adjust log level in `.env`:
```env
LOG_LEVEL=DEBUG  # Options: DEBUG, INFO, WARNING, ERROR
```

### Auto-reload on Changes

Use `--reload` flag with uvicorn:
```bash
python -m uvicorn app.main:app --reload
```

## Integration with Backend

The backend API will call these endpoints:

1. **Document Upload Flow:**
   - Admin uploads PDF to backend
   - Backend stores PDF in Cloudinary
   - Backend calls `POST /api/index` with PDF URL
   - RAG service processes and indexes document
   - Backend updates document status to "indexed"

2. **Chatbot Query Flow:**
   - Mobile user asks question
   - Backend calls `POST /api/query` with question
   - RAG service retrieves context and generates answer
   - Backend returns answer to mobile app

## Next Steps

1. ✅ Service is running
2. ⏳ Test with real PDF documents
3. ⏳ Integrate with backend API
4. ⏳ Deploy to production

For detailed documentation, see [README.md](README.md)
