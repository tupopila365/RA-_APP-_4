# Progress Bar Troubleshooting Guide

## Issue: "Unable to retrieve indexing progress"

This message appears when the frontend cannot get progress updates from the RAG service. Here's how to fix it:

### Solution 1: Restart the RAG Service

The progress tracker is a new module that needs to be loaded.

**Steps:**
1. Stop the RAG service (Ctrl+C in the terminal)
2. Restart it:
   ```bash
   cd RA-_APP-_4/rag-service
   venv\Scripts\activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```
3. Verify it's running: http://localhost:8001/health

### Solution 2: Check RAG Service is Running

**Test the health endpoint:**
```bash
curl http://localhost:8001/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true
}
```

### Solution 3: Test Progress Endpoint Directly

**Test with a document ID:**
```bash
curl http://localhost:8001/index/progress/test123
```

**Expected response (if no progress):**
```json
{
  "status": "success",
  "data": {
    "status": "not_found",
    "stage": "unknown",
    "percentage": 0,
    "message": "No indexing progress found..."
  }
}
```

### Solution 4: Check Backend Can Reach RAG Service

**Check backend .env file:**
```env
RAG_SERVICE_URL=http://localhost:8001
```

**Test from backend:**
1. Open backend terminal
2. Check logs for RAG service connection errors
3. Look for messages like "RAG progress check failed"

### Solution 5: Use Fallback Progress

The system is designed to work even if progress tracking fails. It will:
1. Try to get real progress from RAG service
2. If that fails, use simulated progress
3. Still complete successfully

**What you'll see:**
- Progress bar moves smoothly from 70% to 95%
- Message: "Processing document and creating embeddings..."
- Eventually completes at 100%

## How the Progress System Works

### Normal Flow (With Progress Tracking):
```
1. Upload file (0-70%) - Real progress
2. RAG service starts indexing
3. Frontend polls every 2 seconds
4. Gets real progress from RAG (70-100%)
5. Shows detailed messages
6. Completes at 100%
```

### Fallback Flow (Without Progress Tracking):
```
1. Upload file (0-70%) - Real progress
2. RAG service starts indexing
3. Frontend polls every 2 seconds
4. Can't get progress, uses simulation
5. Shows generic message
6. Completes at 100%
```

## Verification Steps

### 1. Check All Services Are Running

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: RAG Service
cd RA-_APP-_4/rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8001

# Terminal 3: Backend
cd RA-_APP-_4/backend
npm run dev

# Terminal 4: Admin
cd RA-_APP-_4/admin
npm run dev
```

### 2. Test Progress Endpoint Chain

**Test RAG Service directly:**
```bash
curl http://localhost:8001/index/progress/test123
```

**Test Backend proxy:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/documents/test123/indexing-progress
```

### 3. Upload a Test Document

1. Go to http://localhost:5173/documents/upload
2. Upload a small PDF
3. Watch the browser console (F12)
4. Look for progress polling requests
5. Check for any errors

## Common Issues

### Issue: Progress Stuck at 70%

**Cause:** RAG service not responding

**Fix:**
1. Check RAG service is running
2. Check Ollama is running
3. Restart RAG service
4. Check RAG service logs

### Issue: Progress Jumps to 100% Immediately

**Cause:** Document already indexed or very small

**Fix:**
- This is normal for small documents
- Try uploading a larger PDF (5-10 pages)

### Issue: "Failed to upload document"

**Cause:** Backend or Cloudinary issue

**Fix:**
1. Check backend is running
2. Check Cloudinary credentials in backend/.env
3. Check backend logs for errors

### Issue: Progress Shows But Never Completes

**Cause:** RAG indexing stuck or failed

**Fix:**
1. Check RAG service logs
2. Check Ollama is responding
3. Verify models are loaded: `ollama list`
4. Restart Ollama and RAG service

## Debug Mode

### Enable Detailed Logging

**RAG Service:**
Edit `rag-service/.env`:
```env
LOG_LEVEL=DEBUG
```

**Backend:**
Check logs in terminal for detailed messages

**Frontend:**
Open browser console (F12) to see:
- Progress polling requests
- Progress data received
- Any errors

### Check Progress Data

**In browser console:**
```javascript
// After uploading, check progress
fetch('/api/documents/YOUR_DOCUMENT_ID/indexing-progress', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
```

## Expected Behavior

### With Progress Tracking Working:
- Upload: 0-70% (fast, real progress)
- Downloading: 70-73% (fast)
- Extracting: 73-76% (fast)
- Chunking: 76-79% (fast)
- Embedding: 79-95% (slow, shows chunk progress)
- Storing: 95-98% (fast)
- Complete: 100%

### With Fallback Progress:
- Upload: 0-70% (fast, real progress)
- Indexing: 70-95% (smooth animation, 2% every 2 seconds)
- Complete: 100%

## Still Having Issues?

1. **Restart everything:**
   - Stop all services
   - Start Ollama
   - Start RAG service
   - Start Backend
   - Start Admin
   - Try again

2. **Check logs:**
   - RAG service terminal
   - Backend terminal
   - Browser console

3. **Verify setup:**
   - All dependencies installed
   - All .env files configured
   - All services can reach each other

4. **Test without progress:**
   - The system works even without progress tracking
   - You'll still get a working chatbot
   - Progress bar will use fallback animation

## Summary

The progress bar has two modes:
1. **Real-time mode**: Shows actual progress from RAG service
2. **Fallback mode**: Shows simulated progress

Both modes result in successful document indexing. The fallback mode ensures the system works even if progress tracking fails.

If you see "Unable to retrieve indexing progress", the system is using fallback mode. The document will still be indexed successfully!
