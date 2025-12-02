# Ollama Models Missing - Complete Troubleshooting Guide

## Problem Summary

Your RAG service startup logs show:
```
WARNING - Model nomic-embed-text:latest not found. Available models: ['', '']
WARNING - Model llama3.2:1b not found. Available models: ['', '']
```

This indicates that Ollama is running but has no models installed, or the models list is corrupted.

---

## Step 1: Verify Ollama is Running

### Check if Ollama Service is Active

```cmd
ollama list
```

**Expected Output (if working):**
```
NAME                    ID              SIZE    MODIFIED
nomic-embed-text:latest:latest abc123def456    274 MB  2 days ago
llama3.2:1b            xyz789abc123    4.7 GB  2 days ago
```

**If you see an error:**
- "Error: could not connect to ollama" → Ollama is not running
- Empty list or `['', '']` → Models are missing or corrupted

---

## Step 2: Test Ollama API Manually

### Test the /api/tags Endpoint

This is what your Python service calls internally:

```cmd
curl http://localhost:11434/api/tags
```

**Expected Response (healthy):**
```json
{
  "models": [
    {
      "name": "nomic-embed-text:latest:latest",
      "modified_at": "2024-01-15T10:30:00Z",
      "size": 274000000,
      "digest": "abc123..."
    },
    {
      "name": "llama3.2:1b",
      "modified_at": "2024-01-15T11:00:00Z",
      "size": 4700000000,
      "digest": "xyz789..."
    }
  ]
}
```

**Problem Response (what you're seeing):**
```json
{
  "models": [
    {"name": "", ...},
    {"name": "", ...}
  ]
}
```

---

## Step 3: Install/Reinstall Ollama Models

### Option A: Install Models (if missing)

```cmd
REM Pull the embedding model (274 MB)
ollama pull nomic-embed-text:latest

REM Pull the LLM model (4.7 GB)
ollama pull llama3.2:1b
```

**Wait for downloads to complete.** This may take 5-30 minutes depending on your internet speed.

### Option B: Verify Model Installation

After pulling, verify:

```cmd
ollama list
```

You should see both models listed with their sizes.

### Option C: Test Models Directly

Test if models actually work:

```cmd
REM Test embedding model
ollama run nomic-embed-text:latest "test"

REM Test LLM model
ollama run llama3.2:1b "Hello, how are you?"
```

If these commands work, the models are functional.

---

## Step 4: Clean Reinstall (if corrupted)

If models appear in `ollama list` but show as `['', '']` in the API, Ollama may be corrupted.

### Windows Clean Reinstall Steps

1. **Stop Ollama Service:**
   ```cmd
   taskkill /F /IM ollama.exe
   ```

2. **Uninstall Ollama:**
   - Go to Settings → Apps → Ollama
   - Click "Uninstall"

3. **Delete Ollama Data Directory:**
   ```cmd
   rmdir /S /Q "%USERPROFILE%\.ollama"
   ```

4. **Download Fresh Ollama:**
   - Visit: https://ollama.com/download
   - Download Windows installer
   - Run installer

5. **Start Ollama:**
   ```cmd
   ollama serve
   ```
   Keep this terminal open.

6. **Pull Models Again:**
   ```cmd
   ollama pull nomic-embed-text:latest
   ollama pull llama3.2:1b
   ```

7. **Verify Installation:**
   ```cmd
   ollama list
   curl http://localhost:11434/api/tags
   ```

---

## Step 5: Improve Python Service Error Handling

Your RAG service should fail gracefully when models are missing. Let's add better error handling.

### Current Behavior
- Service starts even if models are missing
- Only shows warnings in logs
- May crash when trying to use missing models

### Recommended Improvements

I can update your `app/main.py` to:
1. Check for models on startup
2. Provide clear error messages
3. Optionally prevent startup if models are missing
4. Add a `/models` endpoint to check model status

Would you like me to implement these improvements?

---

## Step 6: Verify RAG Service After Fix

Once Ollama models are installed:

1. **Restart RAG Service:**
   ```cmd
   cd RA-_APP-_4\rag-service
   venv\Scripts\activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

2. **Check Startup Logs:**
   You should see:
   ```
   ✓ Ollama service is accessible
   ✓ Embedding model 'nomic-embed-text:latest' is available
   ✓ LLM model 'llama3.2:1b' is available
   ```

3. **Test Health Endpoint:**
   ```cmd
   curl http://localhost:8001/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "ollama_connected": true,
     "chromadb_connected": true
   }
   ```

4. **Test Embedding Generation:**
   ```cmd
   curl -X POST http://localhost:8001/api/query ^
     -H "Content-Type: application/json" ^
     -d "{\"question\": \"test question\", \"top_k\": 3}"
   ```

---

## Common Issues and Solutions

### Issue 1: "Model not found" after pulling

**Cause:** Model name mismatch

**Solution:**
```cmd
REM Check exact model names
ollama list

REM If model shows as "nomic-embed-text:latest:latest", update .env:
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest:latest
```

### Issue 2: Ollama uses too much memory

**Cause:** Large models loaded in memory

**Solution:**
```cmd
REM Use smaller models
ollama pull llama3.2:1b-q4_0  # Quantized version (smaller)
```

### Issue 3: Models download but disappear

**Cause:** Disk space or permissions issue

**Solution:**
```cmd
REM Check disk space
dir "%USERPROFILE%\.ollama\models"

REM Check permissions (run as administrator if needed)
```

### Issue 4: Port 11434 already in use

**Cause:** Another Ollama instance running

**Solution:**
```cmd
REM Find process using port
netstat -ano | findstr :11434

REM Kill the process (replace PID)
taskkill /F /PID <PID>

REM Start Ollama again
ollama serve
```

---

## Quick Diagnostic Script

Save this as `check-ollama.bat` in your project root:

```batch
@echo off
echo ========================================
echo Ollama Diagnostic Check
echo ========================================
echo.

echo [1] Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Ollama is running
) else (
    echo ✗ Ollama is NOT running
    echo   Run: ollama serve
    goto :end
)
echo.

echo [2] Listing installed models...
ollama list
echo.

echo [3] Checking API response...
curl -s http://localhost:11434/api/tags
echo.

echo [4] Testing RAG service health...
curl -s http://localhost:8001/health
echo.

:end
echo ========================================
echo Diagnostic complete
echo ========================================
pause
```

Run it:
```cmd
check-ollama.bat
```

---

## Prevention Tips

1. **Always start Ollama first** before RAG service
2. **Keep Ollama running** in a dedicated terminal
3. **Monitor disk space** - models are large (5+ GB)
4. **Use model tags** explicitly in .env (e.g., `nomic-embed-text:latest:latest`)
5. **Check logs** regularly for warnings

---

## Next Steps

1. ✅ Verify Ollama is running: `ollama list`
2. ✅ Install missing models: `ollama pull nomic-embed-text:latest` and `ollama pull llama3.2:1b`
3. ✅ Test API manually: `curl http://localhost:11434/api/tags`
4. ✅ Restart RAG service and check logs
5. ✅ Test health endpoint: `curl http://localhost:8001/health`

---

## Need More Help?

If you're still seeing issues after following this guide:

1. Share the output of:
   - `ollama list`
   - `curl http://localhost:11434/api/tags`
   - RAG service startup logs

2. Check Ollama logs:
   - Windows: `%USERPROFILE%\.ollama\logs\`

3. Verify Python dependencies:
   ```cmd
   pip show ollama
   ```

---

## Summary

The `Available models: ['', '']` error means:
- ✅ Ollama is running (connection works)
- ❌ No models are installed or model data is corrupted
- 🔧 Solution: Pull models with `ollama pull <model-name>`

Most common fix:
```cmd
ollama pull nomic-embed-text:latest
ollama pull llama3.2:1b
```

Then restart your RAG service.
