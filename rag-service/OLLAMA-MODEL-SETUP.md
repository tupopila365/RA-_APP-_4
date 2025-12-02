# Ollama Model Setup Guide

This guide explains how the RAG service automatically detects and manages Ollama models.

## Features

The RAG service now includes automatic Ollama model management:

1. **Model Detection**: Checks if required models exist before starting
2. **Automatic Pulling**: Downloads missing models automatically (configurable)
3. **Custom Model Path**: Supports custom Ollama model directories
4. **Startup Validation**: Ensures all models are ready before the service starts

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
OLLAMA_LLM_MODEL=llama3.2:1b

# Optional: Custom path for Ollama models
# OLLAMA_MODELS_PATH=D:/ollama-models

# Automatically pull missing models on startup (default: true)
OLLAMA_AUTO_PULL=true
```

### Custom Model Path

If your Ollama models are not in the default location (`C:\Users\<username>\.ollama\models`), you can specify a custom path:

```env
OLLAMA_MODELS_PATH=D:/ollama-models
```

The service will automatically set the `OLLAMA_MODELS` environment variable to this path.

## Usage

### Automatic Setup (Recommended)

The RAG service automatically checks and pulls models on startup:

```bash
cd rag-service
python -m uvicorn app.main:app --reload
```

You'll see output like:

```
============================================================
Ollama Model Setup
============================================================
✓ Ollama service is running at http://localhost:11434

Checking model: nomic-embed-text:latest
✓ Model 'nomic-embed-text:latest' is ready

Checking model: llama3.2:1b
Model 'llama3.2:1b' not found. Attempting to pull...
Pulling model 'llama3.2:1b'... This may take several minutes.
✓ Successfully pulled model 'llama3.2:1b'
✓ Model 'llama3.2:1b' is ready

============================================================
✓ All required models are available!
============================================================
```

### Manual Check

You can check model availability before starting the service:

```bash
# Basic check
python check_ollama_models.py

# With custom model path
python check_ollama_models.py --models-path "D:/ollama-models"

# Without auto-pull (just check, don't download)
python check_ollama_models.py --no-auto-pull

# Custom models
python check_ollama_models.py --embedding-model "nomic-embed-text:latest" --llm-model "llama3.2:3b"
```

### Disable Auto-Pull

If you want to manually manage models, disable auto-pull:

```env
OLLAMA_AUTO_PULL=false
```

The service will warn you about missing models but won't download them automatically.

## Programmatic Usage

You can use the model manager in your own Python code:

```python
from app.utils.ollama_setup import OllamaModelManager, initialize_ollama_models

# Simple initialization
success = initialize_ollama_models(
    embedding_model='nomic-embed-text:latest',
    llm_model='llama3.2:1b',
    custom_model_path='D:/ollama-models',  # Optional
    auto_pull=True
)

if not success:
    print("Warning: Some models are missing!")

# Advanced usage with OllamaModelManager
manager = OllamaModelManager(
    base_url='http://localhost:11434',
    custom_model_path='D:/ollama-models'
)

# Check if Ollama is running
if manager.check_ollama_running():
    print("Ollama is running")

# List available models
models = manager.list_available_models()
print(f"Available models: {models}")

# Check specific model
if manager.is_model_available('llama3.2:1b'):
    print("Model is available")

# Pull a model
manager.pull_model('llama3.2:1b')

# Setup multiple models
all_ready, missing = manager.setup_models(
    required_models=['nomic-embed-text:latest', 'llama3.2:1b'],
    auto_pull=True
)
```

## Troubleshooting

### Models Not Found

If models aren't detected:

1. **Check Ollama is running**:
   ```bash
   ollama list
   ```

2. **Verify model names**:
   ```bash
   ollama list
   ```
   Make sure the model names in your `.env` match exactly.

3. **Check custom path** (if using):
   - Ensure the path exists
   - Verify Ollama can access it
   - Check for typos in the path

### Pull Fails

If automatic pulling fails:

1. **Check internet connection**
2. **Verify Ollama CLI is in PATH**:
   ```bash
   ollama --version
   ```

3. **Pull manually**:
   ```bash
   ollama pull nomic-embed-text:latest
   ollama pull llama3.2:1b
   ```

### Custom Path Not Working

If custom model path isn't working:

1. **Use absolute paths**:
   ```env
   OLLAMA_MODELS_PATH=D:/ollama-models
   ```

2. **Check permissions**: Ensure the directory is readable

3. **Restart Ollama** after changing the path

## Model Recommendations

### Embedding Models
- `nomic-embed-text:latest` (recommended) - 274MB, fast and accurate
- `mxbai-embed-large` - 669MB, higher quality

### LLM Models
- `llama3.2:1b` (recommended) - 4.7GB, good balance
- `llama3.2:3b` - 2GB, faster but less capable
- `llama3.1:70b` - 40GB, highest quality (requires powerful hardware)

## API Reference

### `initialize_ollama_models()`

```python
def initialize_ollama_models(
    embedding_model: str,
    llm_model: str,
    base_url: str = "http://localhost:11434",
    custom_model_path: str = None,
    auto_pull: bool = True
) -> bool
```

**Parameters:**
- `embedding_model`: Name of the embedding model
- `llm_model`: Name of the LLM model
- `base_url`: Ollama API URL
- `custom_model_path`: Optional custom model directory
- `auto_pull`: Whether to automatically pull missing models

**Returns:**
- `True` if all models are available, `False` otherwise

### `OllamaModelManager`

```python
class OllamaModelManager:
    def __init__(self, base_url: str, custom_model_path: str = None)
    def check_ollama_running(self) -> bool
    def list_available_models(self) -> List[str]
    def is_model_available(self, model_name: str) -> bool
    def pull_model(self, model_name: str) -> bool
    def ensure_model_available(self, model_name: str, auto_pull: bool = True) -> bool
    def setup_models(self, required_models: List[str], auto_pull: bool = True) -> Tuple[bool, List[str]]
```

## Best Practices

1. **Use auto-pull in development**: Set `OLLAMA_AUTO_PULL=true` for convenience
2. **Disable auto-pull in production**: Pre-pull models and set `OLLAMA_AUTO_PULL=false`
3. **Monitor startup logs**: Check for model availability warnings
4. **Use the check script**: Run `check_ollama_models.py` before deployment
5. **Keep models updated**: Periodically run `ollama pull <model>` to get updates

## See Also

- [Ollama Documentation](https://ollama.ai/docs)
- [Available Models](https://ollama.ai/library)
- [RAG Service Documentation](./README.md)
