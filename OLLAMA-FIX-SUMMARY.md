# Ollama Models Missing - Fix Summary

## Problem

Your RAG service showed:
```
WARNING - Model nomic-embed-text not found. Available models: ['', '']
WARNING - Model llama3.1:8b not found. Available models: ['', '']
```

## Root Cause

Ollama is running but has **no models installed** or the model registry is corrupted.

---

## Quick Fix (3 Steps)

### Step 1: Verify Ollama is Running

```cmd
ollama list
```

If you see an error, start Ollama:
```cmd
ollama serve
```

### Step 2: Install Required Models

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

Wait for downloads to complete (5-30 minutes depending on internet speed).

### Step 3: Restart RAG Service

```cmd
cd RA-_APP-_4\rag-service
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

You should now see:
```
✓ Ollama service is accessible
✓ Embedding model 'nomic-embed-text' is available
✓ LLM model 'llama3.1:8b' is available
```

---

## Verification

### Test 1: Check Ollama Models
```cmd
ollama list
```

Expected output:
```
NAME                    ID              SIZE    MODIFIED
nomic-embed-text:latest abc123def456    274 MB  2 days ago
llama3.1:8b            xyz789abc123    4.7 GB  2 days ago
```

### Test 2: Check Ollama API
```cmd
curl http://localhost:11434/api/tags
```

Should return JSON with model names (not empty strings).

### Test 3: Check RAG Service Health
```cmd
curl http://localhost:8001/health
```

Expected:
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true
}
```

### Test 4: Check Model Status (NEW!)
```cmd
curl http://localhost:8001/api/models/status
```

Expected:
```json
{
  "overall_status": "ready",
  "status": {
    "embedding_model": {"available": true, "status": "ready"},
    "llm_model": {"available": true, "status": "ready"}
  },
  "missing_models": [],
  "message": "All required models are available and ready."
}
```

### Test 5: Verify Models Work
```cmd
curl -X POST http://localhost:8001/api/models/verify
```

This will test actual embedding and LLM generation.

---

## What Was Fixed

### 1. Created Troubleshooting Documentation
- `OLLAMA-TROUBLESHOOTING-GUIDE.md` - Complete step-by-step guide
- `OLLAMA-QUICK-REFERENCE.md` - Quick reference card

### 2. Created Diagnostic Tools
- `check-ollama.bat` - Automated diagnostic script
- `setup-ollama-models.bat` - Automated model installation

### 3. Enhanced RAG Service
- Added `/api/models/status` endpoint - Check which models are installed
- Added `/api/models/verify` endpoint - Test models are functional
- Better error messages and logging

### 4. Improved Error Handling
- Service now provides clear instructions when models are missing
- Startup logs show exactly which models are available/missing
- Health check distinguishes between connection and model issues

---

## New Features

### Model Status Endpoint

Check model availability without looking at logs:

```cmd
curl http://localhost:8001/api/models/status
```

Returns:
- Required models
- Installed models
- Missing models
- Installation instructions

### Model Verification Endpoint

Test that models actually work:

```cmd
curl -X POST http://localhost:8001/api/models/verify
```

Returns:
- Embedding test results
- LLM test results
- Functional status

---

## Prevention Tips

1. **Always start Ollama first** before RAG service
2. **Keep Ollama running** in a dedicated terminal
3. **Use the diagnostic script** before starting work:
   ```cmd
   check-ollama.bat
   ```
4. **Check model status** after RAG service starts:
   ```cmd
   curl http://localhost:8001/api/models/status
   ```

---

## Understanding the Error

### Why `Available models: ['', '']`?

This happens when:
1. Ollama is running (connection works)
2. But the model registry is empty or corrupted
3. The API returns models with empty names

### Why Not Just Crash?

The RAG service is designed to start even with missing models because:
- You might want to check status endpoints
- You might be installing models while service is running
- Allows graceful degradation

---

## Files Reference

| File | Purpose |
|------|---------|
| `OLLAMA-TROUBLESHOOTING-GUIDE.md` | Complete troubleshooting guide with all scenarios |
| `OLLAMA-QUICK-REFERENCE.md` | Quick command reference |
| `OLLAMA-FIX-SUMMARY.md` | This file - quick fix summary |
| `check-ollama.bat` | Diagnostic script |
| `setup-ollama-models.bat` | Automated model installation |
| `rag-service/app/routers/models.py` | New model management endpoints |

---

## Next Steps

1. ✅ Run `setup-ollama-models.bat` to install models
2. ✅ Restart RAG service
3. ✅ Verify with `curl http://localhost:8001/api/models/status`
4. ✅ Test chatbot functionality
5. ✅ Bookmark `OLLAMA-QUICK-REFERENCE.md` for future reference

---

## Still Having Issues?

If models still don't show up after installation:

1. **Check Ollama logs:**
   - Windows: `%USERPROFILE%\.ollama\logs\`

2. **Try clean reinstall:**
   - See "Step 4: Clean Reinstall" in `OLLAMA-TROUBLESHOOTING-GUIDE.md`

3. **Check disk space:**
   - Models need ~5 GB total
   - Location: `%USERPROFILE%\.ollama\models\`

4. **Verify Python ollama package:**
   ```cmd
   pip show ollama
   ```

---

## Summary

**Problem:** Ollama models missing  
**Cause:** Models not installed  
**Solution:** Run `setup-ollama-models.bat`  
**Verification:** `curl http://localhost:8001/api/models/status`  
**Time:** 5-30 minutes (mostly download time)

You're now equipped with:
- ✅ Automated installation script
- ✅ Diagnostic tools
- ✅ New API endpoints for model management
- ✅ Complete troubleshooting documentation
- ✅ Quick reference guide

Good luck! 🚀
