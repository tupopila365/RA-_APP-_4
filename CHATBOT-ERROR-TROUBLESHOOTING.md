# Chatbot Error Troubleshooting Guide

## Error: "An error occurred while processing your question"

This error appears when the chatbot cannot process a query. Here's how to diagnose and fix it:

## Quick Diagnosis Checklist

Run through these checks in order:

### ✅ 1. Is Ollama Running?

```bash
ollama list
```

**Expected:** Should show your models (nomic-embed-text, llama3.1:8b)

**If not running:**
```bash
ollama serve
```

### ✅ 2. Is RAG Service Running?

```bash
curl http://localhost:8001/health
```

**Expected:**
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true
}
```

**If not running:**
```bash
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### ✅ 3. Is Backend Running?

```bash
curl http://localhost:3000/health
```

**Expected:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

**If not running:**
```bash
cd RA-_APP-_4/backend
npm run dev
```

### ✅ 4. Are Documents Indexed?

The chatbot needs indexed documents to answer questions.

**Check via admin panel:**
1. Go to http://localhost:5173/documents
2. Look for documents with "Indexed" status (green checkmark)
3. If no documents or all show "Indexing", wait or upload a document

**Check via API:**
```bash
curl http://localhost:8001/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test", "top_k": 5}'
```

## Common Error Scenarios

### Scenario 1: RAG Service Not Running

**Symptoms:**
- Error: "The chatbot service is temporarily unavailable"
- Backend logs show: "RAG service is unavailable"

**Solution:**
```bash
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Scenario 2: Ollama Not Running

**Symptoms:**
- RAG service health shows: `"ollama_connected": false`
- Error: "Failed to generate embedding"

**Solution:**
```bash
# Start Ollama
ollama serve

# Verify models are available
ollama list

# If models missing, pull them
ollama pull nomic-embed-text
ollama pull llama3.1:8b
```

### Scenario 3: No Documents Indexed

**Symptoms:**
- Query returns: "I couldn't find any relevant information..."
- No error, but unhelpful response

**Solution:**
1. Upload documents via admin panel
2. Wait for indexing to complete (green "Indexed" status)
3. Try querying again

### Scenario 4: ChromaDB Issues

**Symptoms:**
- RAG service health shows: `"chromadb_connected": false`
- Error: "Failed to search vector store"

**Solution:**
```bash
# Stop RAG service
# Delete ChromaDB data (will need to re-index documents)
cd RA-_APP-_4/rag-service
rmdir /s /q chroma_db

# Restart RAG service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Re-upload and index documents
```

### Scenario 5: Backend Can't Reach RAG Service

**Symptoms:**
- Backend logs show connection errors
- Error: "ECONNREFUSED" or "Network error"

**Solution:**
1. Check backend `.env` file:
   ```env
   RAG_SERVICE_URL=http://localhost:8001
   ```
2. Verify RAG service is running on port 8001
3. Check firewall isn't blocking localhost connections

## Detailed Troubleshooting Steps

### Step 1: Check All Services

**Terminal 1 - Ollama:**
```bash
ollama serve
```
Should show: "Ollama is running"

**Terminal 2 - RAG Service:**
```bash
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
Should show: "Application startup complete"

**Terminal 3 - Backend:**
```bash
cd RA-_APP-_4/backend
npm run dev
```
Should show: "Server running on port 3000"

**Terminal 4 - Mobile App (optional):**
```bash
cd RA-_APP-_4/app
npx expo start
```

### Step 2: Test RAG Service Directly

**Test health:**
```bash
curl http://localhost:8001/health
```

**Test query (if documents indexed):**
```bash
curl -X POST http://localhost:8001/api/query \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What is this about?\", \"top_k\": 5}"
```

**Expected response:**
```json
{
  "answer": "Based on the documents...",
  "sources": [...],
  "confidence": 0.85
}
```

### Step 3: Test Backend Chatbot Endpoint

```bash
curl -X POST http://localhost:3000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What is this about?\"}"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "answer": "...",
    "sources": [...],
    "timestamp": "..."
  }
}
```

### Step 4: Check Logs

**RAG Service Logs:**
Look for errors in the RAG service terminal:
- "Failed to generate embedding" → Ollama issue
- "Vector store search failed" → ChromaDB issue
- "Failed to generate answer" → LLM issue

**Backend Logs:**
Look for errors in the backend terminal:
- "RAG service is unavailable" → RAG service not running
- "Error processing chatbot query" → Check details

**Browser Console:**
Open browser console (F12) and look for:
- Network errors (red in Network tab)
- API response errors
- JavaScript errors

## Testing the Complete Flow

### 1. Upload a Test Document

1. Go to http://localhost:5173/documents/upload
2. Upload a PDF document
3. Wait for "Indexed" status (green checkmark)

### 2. Test Query in Mobile App

1. Open mobile app
2. Navigate to Chatbot screen
3. Ask a question related to your document
4. Should receive an answer with sources

### 3. Verify Response

**Good response:**
- Answer is relevant to your question
- Sources are listed
- No error messages

**Bad response:**
- "I couldn't find any relevant information..." → No documents indexed or question not related
- Error message → Check logs

## Environment Variables

### Backend `.env`

```env
# RAG Service
RAG_SERVICE_URL=http://localhost:8001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/roads-authority

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### RAG Service `.env`

```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.1:8b

# ChromaDB
CHROMADB_PATH=./chroma_db

# RAG Settings
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K_RESULTS=5

# Logging
LOG_LEVEL=INFO
```

## Performance Issues

### Slow Responses

**Symptoms:**
- Queries take 10+ seconds
- Timeout errors

**Solutions:**
1. **Check system resources:**
   - Ollama uses significant CPU/RAM
   - Close other applications
   - Ensure sufficient RAM (8GB+ recommended)

2. **Reduce chunk size:**
   - Edit `rag-service/.env`
   - Set `TOP_K_RESULTS=3` (instead of 5)

3. **Use smaller model:**
   - Edit `rag-service/.env`
   - Set `OLLAMA_LLM_MODEL=llama3.1:8b` (if using larger)

### Out of Memory

**Symptoms:**
- Ollama crashes
- System becomes unresponsive

**Solutions:**
1. **Use smaller model:**
   ```bash
   ollama pull llama3.1:8b  # Instead of larger models
   ```

2. **Reduce concurrent requests:**
   - Only run one query at a time
   - Wait for previous query to complete

3. **Increase system RAM:**
   - Close other applications
   - Consider upgrading RAM

## Still Having Issues?

### 1. Restart Everything

```bash
# Stop all services (Ctrl+C in each terminal)

# Start in order:
# 1. Ollama
ollama serve

# 2. RAG Service
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 3. Backend
cd RA-_APP-_4/backend
npm run dev

# 4. Admin (if needed)
cd RA-_APP-_4/admin
npm run dev

# 5. Mobile App (if needed)
cd RA-_APP-_4/app
npx expo start
```

### 2. Check System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Disk: 10GB free space
- OS: Windows 10/11, macOS, Linux

**Recommended:**
- CPU: 8+ cores
- RAM: 16GB+
- Disk: 20GB+ free space
- SSD for better performance

### 3. Verify Ollama Models

```bash
ollama list
```

**Should show:**
```
NAME                    ID              SIZE
nomic-embed-text:latest abc123...       274MB
llama3.1:8b            def456...       4.7GB
```

**If missing:**
```bash
ollama pull nomic-embed-text
ollama pull llama3.1:8b
```

### 4. Test with Simple Query

Try a very simple question first:
- "Hello" or "Hi"
- "What is this?"
- "Help"

If these work, the issue might be with:
- Document content not matching your question
- Question too complex
- Need more/better documents

## Error Messages Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "The chatbot service is temporarily unavailable" | RAG service down | Start RAG service |
| "Failed to generate embedding" | Ollama not running | Start Ollama |
| "Failed to search vector store" | ChromaDB issue | Restart RAG service |
| "Failed to generate answer" | LLM error | Check Ollama, restart |
| "I couldn't find any relevant information" | No indexed documents | Upload documents |
| "Question is required" | Empty question | Enter a question |
| "Question must not exceed 1000 characters" | Question too long | Shorten question |

## Summary

Most chatbot errors are caused by:
1. **Services not running** → Start all services
2. **No documents indexed** → Upload and index documents
3. **Ollama issues** → Restart Ollama, check models
4. **Network issues** → Check service URLs in .env files

The chatbot requires all three services (Ollama, RAG Service, Backend) to be running and at least one document to be indexed before it can answer questions.
