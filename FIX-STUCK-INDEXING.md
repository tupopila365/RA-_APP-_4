# Fix Stuck Document Indexing

## Problem
Document shows "Indexing" status for a long time and never completes.

## Quick Diagnosis

### Step 1: Check RAG Service
```bash
curl http://localhost:8001/health
```

**If it fails:** RAG service is down
```bash
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Step 2: Check Ollama
```bash
ollama list
```

**If it fails:** Ollama is not running
```bash
ollama serve
```

### Step 3: Check RAG Service Logs

Look at the RAG service terminal for errors:
- `Failed to generate embedding` → Ollama issue
- `Out of memory` → System resources issue
- `Failed to download PDF` → URL/network issue
- `Timeout` → Document too large

### Step 4: Check Document Status

```bash
# Replace DOCUMENT_ID with your actual document ID
node check-indexing-status.js DOCUMENT_ID
```

## Common Causes & Solutions

### 1. Ollama Not Responding

**Symptoms:**
- RAG service logs show "Failed to generate embedding"
- Health check shows `ollama_connected: false`

**Solution:**
```bash
# Restart Ollama
# Stop it (Ctrl+C if running in terminal)
# Start it again
ollama serve

# Verify models are loaded
ollama list

# Test embedding generation
ollama run nomic-embed-text:latest "test"
```

### 2. Out of Memory

**Symptoms:**
- System becomes slow
- Ollama crashes
- RAG service crashes

**Solution:**
```bash
# Close other applications
# Use smaller model if needed
# Process smaller documents first
# Restart Ollama and RAG service
```

### 3. Large PDF Taking Too Long

**Symptoms:**
- Progress stuck at "Generating embeddings"
- System resources high but no errors

**Solution:**
- **Wait longer** - Large PDFs (50+ pages) can take 10-15 minutes
- Check progress: `curl http://localhost:8001/index/progress/DOCUMENT_ID`
- Monitor system resources (Task Manager)

### 4. RAG Service Crashed

**Symptoms:**
- Can't reach http://localhost:8001
- No response from health check

**Solution:**
```bash
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 5. ChromaDB Issues

**Symptoms:**
- Health check shows `chromadb_connected: false`
- Errors about vector store

**Solution:**
```bash
# Stop RAG service
# Delete ChromaDB data (will need to re-index all documents)
cd RA-_APP-_4/rag-service
rmdir /s /q chroma_db

# Restart RAG service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Manual Fix: Mark Document as Indexed

If indexing is truly stuck and you want to mark it as complete:

### Option 1: Via MongoDB

```javascript
// Connect to MongoDB
use roads-authority

// Find your document
db.documents.find({ title: "Your Document Title" })

// Mark as indexed
db.documents.updateOne(
  { _id: ObjectId("YOUR_DOCUMENT_ID") },
  { $set: { indexed: true } }
)
```

### Option 2: Via Backend API (if you have admin access)

```bash
# You'll need to create an endpoint for this
# Or use MongoDB directly as shown above
```

## Prevention

### 1. Test with Small Documents First
- Upload a 1-2 page PDF first
- Verify it indexes successfully
- Then try larger documents

### 2. Monitor System Resources
- Keep Task Manager open
- Watch CPU and RAM usage
- Ollama can use 4-8GB RAM

### 3. Check Services Before Uploading
```bash
# 1. Ollama
ollama list

# 2. RAG Service
curl http://localhost:8001/health

# 3. Backend
curl http://localhost:3000/health
```

### 4. Use Appropriate Document Sizes
- **Small** (1-10 pages): 1-2 minutes
- **Medium** (10-50 pages): 2-5 minutes
- **Large** (50-100 pages): 5-15 minutes
- **Very Large** (100+ pages): 15-30 minutes

## Troubleshooting Commands

### Check if Ollama is working
```bash
ollama run nomic-embed-text:latest "test embedding"
ollama run llama3.2:1b "test response"
```

### Check RAG service directly
```bash
# Test health
curl http://localhost:8001/health

# Test indexing progress
curl http://localhost:8001/index/progress/YOUR_DOCUMENT_ID
```

### Check backend
```bash
# Get document status
curl http://localhost:3000/api/documents/YOUR_DOCUMENT_ID
```

### Monitor RAG service logs
Watch the RAG service terminal for:
- "Generating embeddings for X chunks" - Progress indicator
- "Successfully indexed X chunks" - Completion
- Any error messages

## Expected Indexing Times

Based on document size and system specs:

| Pages | Chunks | Time (8GB RAM) | Time (16GB RAM) |
|-------|--------|----------------|-----------------|
| 1-5   | 5-20   | 30s - 1min     | 20s - 45s       |
| 5-10  | 20-40  | 1-2 min        | 45s - 1.5min    |
| 10-25 | 40-100 | 2-5 min        | 1.5-3 min       |
| 25-50 | 100-200| 5-10 min       | 3-7 min         |
| 50+   | 200+   | 10-30 min      | 7-20 min        |

## Still Stuck?

### Nuclear Option: Restart Everything

```bash
# 1. Stop all services (Ctrl+C in each terminal)

# 2. Restart in order:
# Terminal 1: Ollama
ollama serve

# Terminal 2: RAG Service
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Terminal 3: Backend
cd RA-_APP-_4/backend
npm run dev

# Terminal 4: Admin
cd RA-_APP-_4/admin
npm run dev

# 3. Try uploading again
```

### Last Resort: Re-upload Document

1. Delete the stuck document from admin panel
2. Wait 30 seconds
3. Upload it again
4. Monitor the progress this time

## Getting Help

If still having issues, collect this information:

1. **RAG Service Logs** - Copy the last 50 lines
2. **System Info** - RAM, CPU, OS
3. **Document Info** - Size, number of pages
4. **Error Messages** - Any errors from terminals
5. **Health Check Results** - Output of health endpoints

Then check:
- RAG service logs for specific errors
- System resources (RAM/CPU usage)
- Ollama responsiveness

## Summary

Most indexing issues are caused by:
1. **Ollama not running** → Start Ollama
2. **RAG service crashed** → Restart RAG service
3. **Out of memory** → Close other apps, use smaller documents
4. **Document too large** → Wait longer or split into smaller PDFs

The key is to check the RAG service logs - they will tell you exactly what's wrong!
