# Ollama Quick Reference Card

## Quick Diagnosis

```cmd
# Check if Ollama is running
ollama list

# Check API directly
curl http://localhost:11434/api/tags

# Check RAG service health
curl http://localhost:8001/health

# Check model status (NEW!)
curl http://localhost:8001/api/models/status
```

---

## Quick Fix for Missing Models

```cmd
# Install both required models
ollama pull nomic-embed-text
ollama pull llama3.1:8b

# Or use the automated script
setup-ollama-models.bat
```

---

## Common Commands

### Start Ollama
```cmd
ollama serve
```
Keep this terminal open!

### List Models
```cmd
ollama list
```

### Install a Model
```cmd
ollama pull <model-name>
```

### Test a Model
```cmd
ollama run <model-name> "test message"
```

### Remove a Model
```cmd
ollama rm <model-name>
```

---

## Required Models for RAG Service

| Model | Size | Purpose |
|-------|------|---------|
| `nomic-embed-text` | 274 MB | Generate embeddings for document chunks |
| `llama3.1:8b` | 4.7 GB | Generate chatbot answers |

---

## Troubleshooting One-Liners

### Problem: "Available models: ['', '']"
```cmd
# Solution: Install models
ollama pull nomic-embed-text && ollama pull llama3.1:8b
```

### Problem: "Could not connect to Ollama"
```cmd
# Solution: Start Ollama
ollama serve
```

### Problem: "Model not found"
```cmd
# Solution: Check exact model name
ollama list
# Update .env if needed
```

### Problem: Port 11434 in use
```cmd
# Find and kill process
netstat -ano | findstr :11434
taskkill /F /PID <PID>
```

---

## New RAG Service Endpoints

### Check Model Status
```cmd
curl http://localhost:8001/api/models/status
```

Returns:
- Which models are installed
- Which models are missing
- Installation instructions
- List of available models

### Verify Models Work
```cmd
curl -X POST http://localhost:8001/api/models/verify
```

Returns:
- Test embedding generation
- Test LLM response generation
- Functional status of each model

---

## Startup Checklist

- [ ] 1. Start Ollama: `ollama serve`
- [ ] 2. Verify models: `ollama list`
- [ ] 3. Install if missing: `setup-ollama-models.bat`
- [ ] 4. Start RAG service
- [ ] 5. Check health: `curl http://localhost:8001/health`
- [ ] 6. Check models: `curl http://localhost:8001/api/models/status`

---

## Expected Healthy Output

### ollama list
```
NAME                    ID              SIZE    MODIFIED
nomic-embed-text:latest abc123def456    274 MB  2 days ago
llama3.1:8b            xyz789abc123    4.7 GB  2 days ago
```

### curl http://localhost:11434/api/tags
```json
{
  "models": [
    {"name": "nomic-embed-text:latest", ...},
    {"name": "llama3.1:8b", ...}
  ]
}
```

### curl http://localhost:8001/health
```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true
}
```

### curl http://localhost:8001/api/models/status
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

---

## Files Created

1. `OLLAMA-TROUBLESHOOTING-GUIDE.md` - Complete troubleshooting guide
2. `check-ollama.bat` - Diagnostic script
3. `setup-ollama-models.bat` - Automated model installation
4. `OLLAMA-QUICK-REFERENCE.md` - This file

---

## Support

For detailed troubleshooting, see: `OLLAMA-TROUBLESHOOTING-GUIDE.md`
