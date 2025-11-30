# Python 3.11 Setup Guide for RAG Service

## Problem

Python 3.13 is not yet supported by several key dependencies:
- `pydantic-core` (requires compilation from source on Python 3.13)
- `chromadb` (has compatibility issues with Python 3.13)
- `fastapi` and `pydantic` (depend on pydantic-core)

## Solution

Use Python 3.11 with a virtual environment to ensure all dependencies install correctly using prebuilt wheels.

## Setup Steps

### Step 1: Install Python 3.11

**Windows:**
1. Download Python 3.11 from https://www.python.org/downloads/
2. Run the installer
3. Check "Add Python 3.11 to PATH"
4. Complete installation
5. Verify installation:
   ```cmd
   python3.11 --version
   ```
   or
   ```cmd
   py -3.11 --version
   ```

**Alternative - Using Chocolatey:**
```cmd
choco install python311
```

**Alternative - Using winget:**
```cmd
winget install Python.Python.3.11
```

### Step 2: Create Virtual Environment

Navigate to the rag-service directory and create a virtual environment:

```cmd
cd RA-_APP-_4\rag-service
python3.11 -m venv venv
```

Or if Python 3.11 is installed via py launcher:
```cmd
py -3.11 -m venv venv
```

### Step 3: Activate Virtual Environment

**Windows CMD:**
```cmd
venv\Scripts\activate.bat
```

**Windows PowerShell:**
```powershell
venv\Scripts\Activate.ps1
```

You should see `(venv)` prefix in your terminal prompt.

### Step 4: Upgrade pip

```cmd
python -m pip install --upgrade pip
```

### Step 5: Install Dependencies

```cmd
pip install -r requirements.txt
```

All packages should now install using prebuilt wheels without compilation.

### Step 6: Verify Installation

```cmd
python -c "import fastapi; import chromadb; import ollama; print('All dependencies installed successfully!')"
```

## Troubleshooting

### Issue: Python 3.11 not found
- Ensure Python 3.11 is installed and added to PATH
- Try using `py -3.11` instead of `python3.11`
- Restart your terminal after installation

### Issue: Virtual environment activation fails
- On PowerShell, you may need to enable script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Issue: pip install still tries to compile
- Ensure you're using Python 3.11 (check with `python --version` inside venv)
- Upgrade pip: `python -m pip install --upgrade pip`
- Try installing with `--only-binary :all:` flag:
  ```cmd
  pip install -r requirements.txt --only-binary :all:
  ```

### Issue: ChromaDB installation fails
- Ensure you're using Python 3.11 (not 3.12 or 3.13)
- Try installing ChromaDB separately first:
  ```cmd
  pip install chromadb==0.4.22
  ```

## Running the Service

After successful installation:

```cmd
# Activate virtual environment (if not already active)
venv\Scripts\activate.bat

# Run the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Running Tests

```cmd
# Activate virtual environment
venv\Scripts\activate.bat

# Run tests
pytest tests/ -v
```

## Deactivating Virtual Environment

When you're done:
```cmd
deactivate
```

## Notes

- Always activate the virtual environment before working on the project
- The `venv` folder is gitignored and should not be committed
- Each developer should create their own virtual environment
- Python 3.11 is the recommended version until dependencies support Python 3.13
