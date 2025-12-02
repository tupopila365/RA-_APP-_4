# Quick Ollama Model Setup

## TL;DR

Your RAG service now automatically detects and downloads Ollama models on startup!

## Quick Start

1. **Update your `.env` file** (optional custom path):
   ```env
   OLLAMA_MODELS_PATH=D:/ollama-models  # Optional: if models are not in default location
   OLLAMA_AUTO_PULL=true  # Auto-download missing models
   ```

2. **Start the service**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Done!** The service will:
   - Check if `nomic-embed-text:latest` and `llama3.2:1b` exist
   - Automatically download them if missing
   - Set up the custom model path if specified

## Manual Check (Optional)

```bash
# Check models before starting
python check_ollama_models.py

# With custom path
python check_ollama_models.py --models-path "D:/ollama-models"
```

## What Changed?

- ✅ Automatic model detection on startup
- ✅ Auto-download missing models (configurable)
- ✅ Support for custom model directories
- ✅ Clear startup logs showing model status
- ✅ No more "model not found" warnings!

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_MODELS_PATH` | None | Custom model directory (optional) |
| `OLLAMA_AUTO_PULL` | `true` | Auto-download missing models |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text:latest` | Embedding model name |
| `OLLAMA_LLM_MODEL` | `llama3.2:1b` | LLM model name |

## Troubleshooting

**Models not downloading?**
- Check Ollama is running: `ollama list`
- Check internet connection
- Try manual pull: `ollama pull nomic-embed-text:latest`

**Custom path not working?**
- Use absolute paths: `D:/ollama-models` not `./models`
- Restart Ollama after changing path
- Check directory permissions

For more details, see [OLLAMA-MODEL-SETUP.md](./OLLAMA-MODEL-SETUP.md)
