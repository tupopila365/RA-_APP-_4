# How to Run the Chatbot System

The chatbot system consists of multiple components that work together. Here's how to run everything:

## System Architecture

```
Mobile App (React Native)
    ↓
Backend API (Node.js/Express)
    ↓
RAG Service (Python/FastAPI)
    ↓
Ollama (Local LLM Runtime)
```

## Prerequisites

Before starting, ensure you have:

1. ✅ **Node.js** installed (for backend)
2. ✅ **Python 3.11** installed (for RAG service)
3. ✅ **Ollama** installed and running
4. ✅ **MongoDB** running (for backend database)

## Step-by-Step Setup

### Step 1: Install and Start Ollama

1. **Download Ollama:**
   - Visit: https://ollama.com/download
   - Download and install for Windows

2. **Start Ollama Service:**
   ```cmd
   ollama serve
   ```
   Keep this terminal open.

3. **Install Required Models:**
   
   **Option A - Automated (Recommended):**
   ```cmd
   cd RA-_APP-_4
   setup-ollama-models.bat
   ```
   
   **Option B - Manual:**
   ```cmd
   ollama pull nomic-embed-text
   ollama pull llama3.1:8b
   ```
   
   This will download:
   - `nomic-embed-text` - For generating embeddings (~274MB)
   - `llama3.1:8b` - For generating answers (~4.7GB)

4. **Verify Models:**
   ```cmd
   ollama list
   ```
   You should see both models listed.
   
   **Quick Diagnostic:**
   ```cmd
   check-ollama.bat
   ```

> 💡 **Tip:** If you see "Available models: ['', '']" errors, see [OLLAMA-FIX-SUMMARY.md](OLLAMA-FIX-SUMMARY.md)

### Step 2: Start the RAG Service

1. **Navigate to RAG service:**
   ```cmd
   cd RA-_APP-_4\rag-service
   ```

2. **Activate Virtual Environment:**
   
   If not already created, run the setup script first:
   ```cmd
   setup_env.bat
   ```
   
   Then activate:
   ```cmd
   venv\Scripts\activate.bat
   ```

3. **Start the RAG Service:**
   ```cmd
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

4. **Verify RAG Service is Running:**
   - Open browser: http://localhost:8001/health
   - You should see:
     ```json
     {
       "status": "healthy",
       "ollama_connected": true,
       "chromadb_connected": true
     }
     ```
   
   - **Check model status (NEW!):**
     ```cmd
     curl http://localhost:8001/api/models/status
     ```
     Should show both models as "ready"

### Step 3: Start the Backend API

1. **Open a new terminal and navigate to backend:**
   ```cmd
   cd RA-_APP-_4\backend
   ```

2. **Install dependencies** (if not already done):
   ```cmd
   npm install
   ```

3. **Ensure MongoDB is running:**
   - If using Docker: `docker-compose up -d mongodb`
   - Or start your local MongoDB instance

4. **Start the Backend:**
   ```cmd
   npm run dev
   ```

5. **Verify Backend is Running:**
   - Open browser: http://localhost:3000/health
   - You should see: `{"success": true, "message": "Server is running"}`

### Step 4: Start the Admin Panel (Optional)

If you want to upload documents:

1. **Open a new terminal:**
   ```cmd
   cd RA-_APP-_4\admin
   ```

2. **Install dependencies** (if not already done):
   ```cmd
   npm install
   ```

3. **Start the Admin Panel:**
   ```cmd
   npm run dev
   ```

4. **Access Admin Panel:**
   - Open browser: http://localhost:5173
   - Login with your admin credentials
   - Navigate to "Documents" to upload PDFs

### Step 5: Start the Mobile App

1. **Open a new terminal:**
   ```cmd
   cd RA-_APP-_4\app
   ```

2. **Install dependencies** (if not already done):
   ```cmd
   npm install
   ```

3. **Start Expo:**
   ```cmd
   npx expo start
   ```

4. **Run on Device:**
   - Scan QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Testing the Chatbot

### 1. Upload a Document (via Admin Panel)

1. Go to http://localhost:5173/documents
2. Click "Upload Document"
3. Fill in:
   - Title: "Test Document"
   - Description: "A test document for the chatbot"
   - Category: Select one
   - File: Upload a PDF
4. Click "Upload Document"
5. Wait for indexing to complete (status will change to "Indexed")

### 2. Test the Chatbot (via Mobile App)

1. Open the mobile app
2. Navigate to "Chatbot" screen
3. Ask a question related to your uploaded document
4. The chatbot should respond with relevant information

### 3. Test via API (Optional)

**Test Document Indexing:**
```cmd
curl -X POST http://localhost:8001/api/index ^
  -H "Content-Type: application/json" ^
  -d "{\"document_url\": \"https://example.com/doc.pdf\", \"document_id\": \"doc_001\", \"title\": \"Test\"}"
```

**Test Query:**
```cmd
curl -X POST http://localhost:8001/api/query ^
  -H "Content-Type: application/json" ^
  -d "{\"question\": \"What is this about?\", \"top_k\": 5}"
```

## Quick Reference - All Services

| Service | Port | URL | Command |
|---------|------|-----|---------|
| Ollama | 11434 | http://localhost:11434 | `ollama serve` |
| RAG Service | 8001 | http://localhost:8001 | `cd rag-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8001` |
| Backend API | 3000 | http://localhost:3000 | `cd backend && npm run dev` |
| Admin Panel | 5173 | http://localhost:5173 | `cd admin && npm run dev` |
| Mobile App | 8081 | Expo QR Code | `cd app && npx expo start` |

## Troubleshooting

### Ollama Not Connected

**Problem:** RAG service shows `"ollama_connected": false` or "Available models: ['', '']"

**Quick Fix:**
```cmd
setup-ollama-models.bat
```

**Manual Solution:**
1. Check if Ollama is running: `ollama list`
2. If not, start it: `ollama serve`
3. Verify models: `ollama list`
4. Pull missing models:
   ```cmd
   ollama pull nomic-embed-text
   ollama pull llama3.1:8b
   ```

**Detailed Help:** See [OLLAMA-FIX-SUMMARY.md](OLLAMA-FIX-SUMMARY.md)

### RAG Service Won't Start

**Problem:** Import errors or dependency issues

**Solution:**
1. Ensure Python 3.11 is installed: `python --version`
2. Recreate virtual environment:
   ```cmd
   cd rag-service
   rmdir /s /q venv
   setup_env.bat
   ```

### Backend Can't Connect to RAG Service

**Problem:** Backend shows RAG service connection errors

**Solution:**
1. Check RAG service is running: http://localhost:8001/health
2. Verify backend .env has correct RAG_SERVICE_URL:
   ```env
   RAG_SERVICE_URL=http://localhost:8001
   ```

### Documents Not Indexing

**Problem:** Documents upload but don't get indexed

**Solution:**
1. Check RAG service logs for errors
2. Verify Ollama is running and models are available
3. Check ChromaDB has write permissions
4. Try manually indexing via API

### Chatbot Not Responding

**Problem:** Chatbot doesn't answer questions

**Solution:**
1. Verify at least one document is indexed (status: "Indexed")
2. Check backend logs for errors
3. Test RAG service directly: http://localhost:8001/docs
4. Ensure question is related to indexed documents

## Stopping Services

To stop all services:

1. **Ollama:** Press `Ctrl+C` in Ollama terminal
2. **RAG Service:** Press `Ctrl+C` in RAG service terminal
3. **Backend:** Press `Ctrl+C` in backend terminal
4. **Admin Panel:** Press `Ctrl+C` in admin terminal
5. **Mobile App:** Press `Ctrl+C` in Expo terminal

## Development Workflow

**Typical workflow for development:**

1. Start Ollama (once per session)
2. Start RAG service (keep running)
3. Start Backend (keep running)
4. Start Admin Panel (when uploading documents)
5. Start Mobile App (when testing)

**For testing changes:**
- RAG service: Auto-reloads with `--reload` flag
- Backend: Auto-reloads with `npm run dev`
- Admin Panel: Auto-reloads with Vite
- Mobile App: Auto-reloads with Expo

## Next Steps

1. ✅ Start all services
2. ✅ Upload test documents
3. ✅ Test chatbot functionality
4. 🚀 Deploy to production

## Additional Resources

- [RAG Service README](rag-service/README.md)
- [RAG Service Quick Start](rag-service/QUICKSTART.md)
- [Backend API Documentation](API.md)
- [Ollama Documentation](https://ollama.com/docs)

### Ollama Troubleshooting Resources (NEW!)
- [OLLAMA-FIX-SUMMARY.md](OLLAMA-FIX-SUMMARY.md) - Quick fix for missing models
- [OLLAMA-TROUBLESHOOTING-GUIDE.md](OLLAMA-TROUBLESHOOTING-GUIDE.md) - Complete troubleshooting guide
- [OLLAMA-QUICK-REFERENCE.md](OLLAMA-QUICK-REFERENCE.md) - Command reference card
- `setup-ollama-models.bat` - Automated model installation
- `check-ollama.bat` - Diagnostic script

## Support

If you encounter issues:
1. Check service health endpoints
2. Review logs in each terminal
3. Verify all prerequisites are installed
4. Check port conflicts
5. Ensure all environment variables are set correctly
