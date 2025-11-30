# Python 3.13 Compatibility Fix - Summary

## Problem Identified

Your system is running **Python 3.13**, but the RAG service dependencies are not yet compatible:

- `pydantic-core==2.14.6` - Requires compilation from source on Python 3.13 (no prebuilt wheels)
- `chromadb==0.4.22` - Has compatibility issues with Python 3.13
- `fastapi` and `pydantic` - Depend on pydantic-core

This causes installation failures and long compilation times.

## Solution Implemented

**Use Python 3.11** with a virtual environment to ensure all dependencies install correctly using prebuilt wheels.

## Files Created

1. **setup_env.bat** - Automated setup script for CMD
2. **setup_env.ps1** - Automated setup script for PowerShell
3. **PYTHON_SETUP_GUIDE.md** - Detailed setup instructions
4. **QUICK_START.md** - Quick reference guide
5. **.gitignore** - Git ignore file for Python projects

## Installation Steps

### Quick Setup (Recommended)

**Option A: Using PowerShell**
```powershell
cd RA-_APP-_4\rag-service
.\setup_env.ps1
```

**Option B: Using CMD**
```cmd
cd RA-_APP-_4\rag-service
setup_env.bat
```

The automated script will:
1. ✅ Check for Python 3.11 installation
2. ✅ Create virtual environment (`venv` folder)
3. ✅ Activate the virtual environment
4. ✅ Upgrade pip to latest version
5. ✅ Install all dependencies from requirements.txt
6. ✅ Verify installation success

### Manual Setup

If you prefer manual setup or the script fails:

1. **Install Python 3.11**
   
   Download from: https://www.python.org/downloads/
   
   Or use package manager:
   ```cmd
   choco install python311
   ```
   or
   ```cmd
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
   
   Note: If PowerShell gives an error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Upgrade pip**
   ```cmd
   python -m pip install --upgrade pip
   ```

5. **Install Dependencies**
   ```cmd
   pip install -r requirements.txt
   ```
   
   All packages should install using prebuilt wheels (no compilation).

6. **Verify Installation**
   ```cmd
   python -c "import fastapi; import chromadb; import ollama; import pytest; print('Success!')"
   ```

## Expected Results

After successful setup:

✅ Virtual environment created in `venv/` folder  
✅ Python 3.11 active in virtual environment  
✅ All dependencies installed from prebuilt wheels  
✅ No compilation errors  
✅ Installation completes in < 2 minutes  
✅ Tests can run successfully  

## Verification Commands

```cmd
# Check Python version (should be 3.11.x)
python --version

# Check installed packages
pip list

# Verify core dependencies
python -c "import fastapi; print('FastAPI OK')"
python -c "import chromadb; print('ChromaDB OK')"
python -c "import ollama; print('Ollama OK')"
python -c "import pytest; print('Pytest OK')"

# Run tests
pytest tests/ -v
```

## Using the Virtual Environment

### Activate (before working)
```cmd
# CMD
venv\Scripts\activate.bat

# PowerShell
venv\Scripts\Activate.ps1
```

You should see `(venv)` prefix in your prompt.

### Deactivate (when done)
```cmd
deactivate
```

## Running the Service

```cmd
# Activate virtual environment first
venv\Scripts\activate.bat

# Start the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Access at:
- API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/health

## Running Tests

```cmd
# Activate virtual environment first
venv\Scripts\activate.bat

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_pdf_processor.py -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Troubleshooting

### Issue: Python 3.11 not found

**Solution:**
1. Install Python 3.11 from https://www.python.org/downloads/
2. Check "Add Python to PATH" during installation
3. Restart terminal
4. Verify: `py -3.11 --version`

### Issue: PowerShell script won't run

**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Dependencies still fail to install

**Solution 1:** Verify Python version inside venv
```cmd
python --version  # Must be 3.11.x
```

**Solution 2:** Try binary-only installation
```cmd
pip install -r requirements.txt --only-binary :all:
```

**Solution 3:** Install ChromaDB separately first
```cmd
pip install chromadb==0.4.22
pip install -r requirements.txt
```

### Issue: Import errors when running code

**Solution:** Ensure virtual environment is activated
```cmd
# You should see (venv) in your prompt
venv\Scripts\activate.bat
```

## Why Python 3.11?

| Python Version | Status | Notes |
|---------------|--------|-------|
| 3.13 | ❌ Not Supported | pydantic-core requires compilation, ChromaDB issues |
| 3.12 | ⚠️ Limited Support | Some packages may require compilation |
| 3.11 | ✅ Recommended | All packages have prebuilt wheels |
| 3.10 | ✅ Supported | Older but stable |

## Benefits of This Setup

✅ **Fast Installation** - Prebuilt wheels install in seconds  
✅ **No Compilation** - No need for C++ build tools  
✅ **Isolated Environment** - Project dependencies don't affect system Python  
✅ **Reproducible** - Same environment on all machines  
✅ **Easy Cleanup** - Just delete `venv/` folder  
✅ **Version Control** - `venv/` is gitignored  

## Next Steps

1. ✅ Run the setup script or follow manual steps
2. ✅ Verify installation with test commands
3. ✅ Run the test suite: `pytest tests/ -v`
4. ✅ Start the service: `uvicorn app.main:app --reload`
5. 🚀 Begin development!

## Additional Resources

- [QUICK_START.md](QUICK_START.md) - Quick reference guide
- [PYTHON_SETUP_GUIDE.md](PYTHON_SETUP_GUIDE.md) - Detailed setup guide
- [tests/README.md](tests/README.md) - Test documentation
- [Python 3.11 Download](https://www.python.org/downloads/)
- [Virtual Environments Guide](https://docs.python.org/3/tutorial/venv.html)

## Support

If you continue to have issues:
1. Check that Python 3.11 is installed: `py -3.11 --version`
2. Ensure virtual environment is activated (see `(venv)` in prompt)
3. Review error messages carefully
4. Check the troubleshooting section above
5. Verify you're in the correct directory: `RA-_APP-_4\rag-service`
