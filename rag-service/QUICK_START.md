# Quick Start Guide - RAG Service

## Prerequisites

- **Python 3.11** (Required - Python 3.13 not yet supported)
- Git (for cloning the repository)

## Installation

### Option 1: Automated Setup (Recommended)

**Using PowerShell:**
```powershell
cd RA-_APP-_4\rag-service
.\setup_env.ps1
```

**Using CMD:**
```cmd
cd RA-_APP-_4\rag-service
setup_env.bat
```

The script will:
1. Check for Python 3.11
2. Create a virtual environment
3. Activate the virtual environment
4. Upgrade pip
5. Install all dependencies
6. Verify the installation

### Option 2: Manual Setup

1. **Install Python 3.11**
   ```cmd
   # Download from https://www.python.org/downloads/
   # Or use package manager:
   choco install python311
   # Or:
   winget install Python.Python.3.11
   ```

2. **Create Virtual Environment**
   ```cmd
   cd RA-_APP-_4\rag-service
   py -3.11 -m venv venv
   ```

3. **Activate Virtual Environment**
   
   CMD:
   ```cmd
   venv\Scripts\activate.bat
   ```
   
   PowerShell:
   ```powershell
   venv\Scripts\Activate.ps1
   ```

4. **Install Dependencies**
   ```cmd
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Verify Installation**
   ```cmd
   python -c "import fastapi; import chromadb; import ollama; print('Success!')"
   ```

## Running the Service

### Start the Server

```cmd
# Make sure virtual environment is activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

The service will be available at:
- API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/health

### Run Tests

```cmd
# Make sure virtual environment is activated
pytest tests/ -v
```

### Run Specific Tests

```cmd
# Unit tests only
pytest tests/test_pdf_processor.py -v

# Integration tests only
pytest tests/test_integration_indexing.py -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

## Common Commands

```cmd
# Activate virtual environment
venv\Scripts\activate.bat

# Deactivate virtual environment
deactivate

# Install new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Check Python version
python --version

# List installed packages
pip list
```

## Troubleshooting

### Python 3.11 Not Found

**Solution:**
- Install Python 3.11 from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal after installation

### Virtual Environment Activation Fails (PowerShell)

**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Dependencies Fail to Install

**Solution 1:** Ensure you're using Python 3.11
```cmd
python --version  # Should show Python 3.11.x
```

**Solution 2:** Try installing with binary-only flag
```cmd
pip install -r requirements.txt --only-binary :all:
```

**Solution 3:** Install problematic packages separately
```cmd
pip install chromadb==0.4.22
pip install pydantic==2.5.3
pip install -r requirements.txt
```

### Import Errors

**Solution:** Make sure virtual environment is activated
```cmd
# You should see (venv) in your prompt
venv\Scripts\activate.bat
```

## Project Structure

```
rag-service/
├── app/                    # Application code
│   ├── main.py            # FastAPI entry point
│   ├── config.py          # Configuration
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   ├── routers/           # API routes
│   └── utils/             # Utilities
├── tests/                 # Test suite
├── venv/                  # Virtual environment (created)
├── requirements.txt       # Dependencies
├── setup_env.bat         # Setup script (CMD)
├── setup_env.ps1         # Setup script (PowerShell)
└── QUICK_START.md        # This file
```

## Next Steps

1. ✅ Install Python 3.11
2. ✅ Create and activate virtual environment
3. ✅ Install dependencies
4. ✅ Run tests to verify setup
5. 🚀 Start developing!

## Additional Resources

- [Python Setup Guide](PYTHON_SETUP_GUIDE.md) - Detailed setup instructions
- [Test Documentation](tests/README.md) - Test suite documentation
- [API Documentation](http://localhost:8001/docs) - Interactive API docs (when running)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Ollama Documentation](https://ollama.ai/)

## Support

If you encounter issues:
1. Check the [Python Setup Guide](PYTHON_SETUP_GUIDE.md)
2. Verify Python version: `python --version`
3. Ensure virtual environment is activated
4. Check error messages carefully
5. Try the troubleshooting steps above
