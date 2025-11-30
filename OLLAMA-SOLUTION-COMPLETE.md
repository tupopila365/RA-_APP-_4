# Ollama Models Missing - Complete Solution

## Your Question Answered

You asked about the warning: `Available models: ['', '']`

Here are the answers to your 5 questions:

---

## 1. Why does Ollama return `Available models: ['', '']`?

**Answer:** Ollama is running and responding to API calls, but it has **no models installed** in its registry. The empty strings `['', '']` indicate that the model list exists but contains entries with no names - essentially a corrupted or empty model registry.

**Technical Details:**
- Your Python service calls `ollama.Client().list()` 
- This hits the endpoint: `http://localhost:11434/api/tags`
- Ollama returns: `{"models": [{"name": "", ...}, {"name": "", ...}]}`
- The empty `name` fields cause the warning

**Root Cause:** Models were never installed, or the Ollama installation is fresh/corrupted.

---

## 2. How do I correctly install and verify the models?

### Quick Method (Automated)

```cmd
cd RA-_APP-_4
setup-ollama-models.bat
```

This script will:
- Check if Ollama is running
- List current models
- Install missing models automatically
- Verify installation
- Test models

### Manual Method

**Step 1: Ensure Ollama is Running**
```cmd
ollama serve
```
Keep this terminal open.

**Step 2: Install Models (in a new terminal)**
```cmd
# Install embedding model (274 MB, ~2-5 minutes)
ollama pull nomic-embed-text

# Install LLM model (4.7 GB, ~10-30 minutes)
ollama pull llama3.1:8b
```

**Step 3: Verify Installation**
```cmd
ollama list
```

Expected output:
```
NAME                    ID              SIZE    MODIFIED
nomic-embed-text:latest abc123def456    274 MB  2 days ago
llama3.1:8b            xyz789abc123    4.7 GB  2 days ago
```

**Step 4: Test Models Work**
```cmd
# Test embedding model
ollama run nomic-embed-text "test"

# Test LLM model
ollama run llama3.1:8b "Hello"
```

---

## 3. How do I test whether Ollama is working by calling `/api/tags` manually?

### Test with curl

```cmd
curl http://localhost:11434/api/tags
```

### Expected Response (Healthy)

```json
{
  "models": [
    {
      "name": "nomic-embed-text:latest",
      "model": "nomic-embed-text:latest",
      "modified_at": "2024-01-15T10:30:00.000Z",
      "size": 274000000,
      "digest": "sha256:abc123...",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "nomic-bert",
        "families": ["nomic-bert"],
        "parameter_size": "137M",
        "quantization_level": "F16"
      }
    },
    {
      "name": "llama3.1:8b",
      "model": "llama3.1:8b",
      "modified_at": "2024-01-15T11:00:00.000Z",
      "size": 4700000000,
      "digest": "sha256:xyz789...",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "llama",
        "families": ["llama"],
        "parameter_size": "8.0B",
        "quantization_level": "Q4_0"
      }
    }
  ]
}
```

### Problem Response (What You're Seeing)

```json
{
  "models": [
    {
      "name": "",
      "model": "",
      ...
    }
  ]
}
```

or

```json
{
  "models": []
}
```

### Test with PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get | ConvertTo-Json -Depth 10
```

### Test with Browser

Open: http://localhost:11434/api/tags

You should see the JSON response directly.

---

## 4. How can I modify my Python service to fail gracefully when models are missing?

### Solution Implemented

I've added two new endpoints to your RAG service:

#### A. Model Status Endpoint

**Endpoint:** `GET /api/models/status`

**Usage:**
```cmd
curl http://localhost:8001/api/models/status
```

**Response when models are ready:**
```json
{
  "overall_status": "ready",
  "ollama_url": "http://localhost:11434",
  "required_models": {
    "embedding": "nomic-embed-text",
    "llm": "llama3.1:8b"
  },
  "status": {
    "embedding_model": {
      "name": "nomic-embed-text",
      "available": true,
      "status": "ready"
    },
    "llm_model": {
      "name": "llama3.1:8b",
      "available": true,
      "status": "ready"
    }
  },
  "available_models": [
    {"name": "nomic-embed-text:latest", "size": 274000000, ...},
    {"name": "llama3.1:8b", "size": 4700000000, ...}
  ],
  "missing_models": [],
  "message": "All required models are available and ready."
}
```

**Response when models are missing:**
```json
{
  "overall_status": "incomplete",
  "status": {
    "embedding_model": {
      "name": "nomic-embed-text",
      "available": false,
      "status": "missing"
    },
    "llm_model": {
      "name": "llama3.1:8b",
      "available": false,
      "status": "missing"
    }
  },
  "missing_models": ["nomic-embed-text", "llama3.1:8b"],
  "instructions": [
    "Install embedding model: ollama pull nomic-embed-text",
    "Install LLM model: ollama pull llama3.1:8b"
  ],
  "message": "Some required models are missing. Please install them using the provided instructions."
}
```

#### B. Model Verification Endpoint

**Endpoint:** `POST /api/models/verify`

**Usage:**
```cmd
curl -X POST http://localhost:8001/api/models/verify
```

**What it does:**
- Actually tests embedding generation
- Actually tests LLM response generation
- Returns functional status

**Response:**
```json
{
  "embedding_test": {
    "status": "success",
    "model": "nomic-embed-text",
    "embedding_dimension": 768,
    "message": "Embedding model is functional"
  },
  "llm_test": {
    "status": "success",
    "model": "llama3.1:8b",
    "response_length": 42,
    "message": "LLM model is functional"
  },
  "overall_status": "fully_functional",
  "message": "All models are installed and functional"
}
```

### Code Changes Made

**File:** `rag-service/app/routers/models.py` (NEW)
- Added model status checking endpoint
- Added model verification endpoint
- Provides clear error messages and installation instructions

**File:** `rag-service/app/main.py` (UPDATED)
- Imported new models router
- Added models router to app

### Current Behavior

Your service now:
1. ✅ Starts even if models are missing (allows checking status)
2. ✅ Shows clear warnings in startup logs
3. ✅ Provides `/api/models/status` endpoint to check models
4. ✅ Provides `/api/models/verify` endpoint to test models
5. ✅ Returns helpful error messages with installation instructions
6. ✅ Distinguishes between "not installed" and "not functional"

### Optional: Prevent Startup if Models Missing

If you want the service to **refuse to start** without models, add this to `app/main.py`:

```python
@app.on_event("startup")
async def startup_event():
    # ... existing code ...
    
    # Check if models are available
    embedding_service = EmbeddingService()
    llm_service = LLMService()
    
    embedding_available = embedding_service.check_model_available()
    llm_available = llm_service.check_model_available()
    
    if not embedding_available or not llm_available:
        logger.error("=" * 60)
        logger.error("CRITICAL: Required models are missing!")
        logger.error("The service cannot function without these models.")
        logger.error("=" * 60)
        
        # Uncomment to prevent startup:
        # raise RuntimeError("Required Ollama models are not installed")
```

---

## 5. If my Ollama is corrupted or empty, how do I reinstall it cleanly?

### Clean Reinstall Steps for Windows

#### Step 1: Stop Ollama

```cmd
taskkill /F /IM ollama.exe
```

#### Step 2: Uninstall Ollama

1. Press `Win + I` to open Settings
2. Go to **Apps** → **Installed apps**
3. Find **Ollama**
4. Click the three dots → **Uninstall**

#### Step 3: Delete Ollama Data Directory

```cmd
rmdir /S /Q "%USERPROFILE%\.ollama"
```

This removes:
- All downloaded models
- Configuration files
- Cache and logs

#### Step 4: Download Fresh Ollama

1. Visit: https://ollama.com/download
2. Download the Windows installer
3. Run the installer
4. Follow installation prompts

#### Step 5: Start Ollama

```cmd
ollama serve
```

Keep this terminal open.

#### Step 6: Install Models

```cmd
# Use automated script
cd RA-_APP-_4
setup-ollama-models.bat
```

Or manually:
```cmd
ollama pull nomic-embed-text
ollama pull llama3.1:8b
```

#### Step 7: Verify Installation

```cmd
# Check models
ollama list

# Check API
curl http://localhost:11434/api/tags

# Check RAG service
curl http://localhost:8001/api/models/status
```

### Alternative: Repair Without Reinstall

If you just want to fix the model registry:

```cmd
# Remove model cache
rmdir /S /Q "%USERPROFILE%\.ollama\models"

# Restart Ollama
taskkill /F /IM ollama.exe
ollama serve

# Reinstall models
ollama pull nomic-embed-text
ollama pull llama3.1:8b
```

---

## Summary of Solutions Provided

### 1. Documentation Created

| File | Purpose |
|------|---------|
| `OLLAMA-TROUBLESHOOTING-GUIDE.md` | Complete troubleshooting guide (all scenarios) |
| `OLLAMA-QUICK-REFERENCE.md` | Quick command reference card |
| `OLLAMA-FIX-SUMMARY.md` | Quick fix summary |
| `OLLAMA-SOLUTION-COMPLETE.md` | This file - answers to your 5 questions |

### 2. Automation Scripts Created

| Script | Purpose |
|--------|---------|
| `setup-ollama-models.bat` | Automated model installation |
| `check-ollama.bat` | Diagnostic script |

### 3. Code Enhancements

| File | Changes |
|------|---------|
| `rag-service/app/routers/models.py` | NEW - Model management endpoints |
| `rag-service/app/main.py` | UPDATED - Added models router |
| `HOW-TO-RUN-CHATBOT.md` | UPDATED - Added troubleshooting references |

### 4. New API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/models/status` | Check which models are installed |
| `POST /api/models/verify` | Test models are functional |

---

## Quick Start Guide

### If You're Starting Fresh

```cmd
# 1. Start Ollama
ollama serve

# 2. Install models (in new terminal)
cd RA-_APP-_4
setup-ollama-models.bat

# 3. Start RAG service
cd rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 4. Verify everything works
curl http://localhost:8001/api/models/status
```

### If You're Troubleshooting

```cmd
# 1. Run diagnostic
cd RA-_APP-_4
check-ollama.bat

# 2. If models are missing, install them
setup-ollama-models.bat

# 3. Restart RAG service
# (Ctrl+C in RAG service terminal, then restart)

# 4. Check status
curl http://localhost:8001/api/models/status
```

---

## Expected Timeline

| Task | Time |
|------|------|
| Install Ollama | 5 minutes |
| Download nomic-embed-text | 2-5 minutes |
| Download llama3.1:8b | 10-30 minutes |
| Start services | 1 minute |
| **Total** | **~20-40 minutes** |

Most time is spent downloading the 4.7 GB LLM model.

---

## Verification Checklist

After following the steps, verify:

- [ ] `ollama list` shows both models
- [ ] `curl http://localhost:11434/api/tags` returns models with names
- [ ] `curl http://localhost:8001/health` shows "healthy"
- [ ] `curl http://localhost:8001/api/models/status` shows "ready"
- [ ] RAG service logs show ✓ for both models
- [ ] No warnings about missing models

---

## Need More Help?

1. **Quick Reference:** See `OLLAMA-QUICK-REFERENCE.md`
2. **Detailed Troubleshooting:** See `OLLAMA-TROUBLESHOOTING-GUIDE.md`
3. **Run Diagnostics:** `check-ollama.bat`
4. **Check Model Status:** `curl http://localhost:8001/api/models/status`

---

## All Your Questions Answered ✅

1. ✅ **Why `['', '']`?** → Models not installed, empty registry
2. ✅ **How to install?** → `setup-ollama-models.bat` or `ollama pull <model>`
3. ✅ **How to test API?** → `curl http://localhost:11434/api/tags`
4. ✅ **Graceful failure?** → New `/api/models/status` endpoint added
5. ✅ **Clean reinstall?** → Uninstall → Delete `%USERPROFILE%\.ollama` → Reinstall

You now have everything you need to diagnose, fix, and prevent this issue! 🎉
