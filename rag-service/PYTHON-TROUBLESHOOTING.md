# RAG Service - Python Installation Troubleshooting

## Issue: NumPy Won't Install on Python 3.13

### The Problem

You're seeing errors like:
```
error C2146: syntax error: missing ')' before identifier 'NPY_INTP_FMT'
```

This happens because **NumPy 1.26.4 doesn't support Python 3.13** yet.

---

## ✅ Solution: Use Python 3.12 (Recommended)

### Step 1: Download Python 3.12

Go to: https://www.python.org/downloads/release/python-3120/

Download: **Windows installer (64-bit)**

### Step 2: Install Python 3.12

1. Run the installer
2. ✅ **Check "Add Python to PATH"**
3. Click "Install Now"
4. Wait for installation to complete

### Step 3: Verify Installation

Open a **new** Command Prompt or PowerShell:

```bash
py -3.12 --version
```

Should show: `Python 3.12.x`

### Step 4: Run Setup Script

```bash
cd RA-_APP-_4\rag-service
SETUP-PYTHON-312.bat
```

This will:
- Remove old Python 3.13 virtual environment
- Create new Python 3.12 virtual environment
- Install all dependencies correctly

### Step 5: Start RAG Service

```bash
START-RAG.bat
```

Done! ✅

---

## Alternative: Manual Setup

If the script doesn't work, do it manually:

```bash
cd RA-_APP-_4\rag-service

# Remove old venv
rmdir /s /q venv

# Create new venv with Python 3.12
py -3.12 -m venv venv

# Activate
venv\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

---

## Why Python 3.12 Instead of 3.13?

| Python Version | NumPy Support | ChromaDB Support | Recommended |
|----------------|---------------|------------------|-------------|
| **3.12** | ✅ Full | ✅ Full | ✅ **YES** |
| 3.13 | ⚠️ Limited | ⚠️ Limited | ❌ No |
| 3.11 | ✅ Full | ✅ Full | ✅ Yes |

Python 3.13 is very new (released October 2024). Most scientific libraries like NumPy, SciPy, and ChromaDB haven't fully updated yet.

**Python 3.12 is the sweet spot** - stable, fast, and fully compatible.

---

## Checking Your Python Version

### Check System Python

```bash
python --version
py --version
```

### Check All Installed Python Versions

```bash
py --list
```

Output example:
```
 -V:3.13 *        Python 3.13.0
 -V:3.12          Python 3.12.7
 -V:3.11          Python 3.11.9
```

### Check Virtual Environment Python

```bash
cd RA-_APP-_4\rag-service
venv\Scripts\activate
python --version
```

---

## Common Issues

### Issue 1: "py -3.12 not found"

**Solution:** Install Python 3.12 from python.org

### Issue 2: Multiple Python Versions Conflict

**Solution:** Use `py -3.12` to explicitly use Python 3.12

### Issue 3: Virtual Environment Still Uses Python 3.13

**Solution:** Delete venv and recreate:
```bash
rmdir /s /q venv
py -3.12 -m venv venv
```

### Issue 4: Pip Install Still Fails

**Solution:** Upgrade pip first:
```bash
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## Quick Reference

### Create venv with specific Python version
```bash
py -3.12 -m venv venv
```

### Activate venv
```bash
venv\Scripts\activate
```

### Check Python version in venv
```bash
python --version
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Deactivate venv
```bash
deactivate
```

---

## Still Having Issues?

### Option 1: Use Pre-built Wheels

Try installing from pre-built wheels:

```bash
pip install --only-binary :all: numpy
pip install -r requirements.txt
```

### Option 2: Use Conda

If nothing works, try Conda:

```bash
# Install Miniconda from: https://docs.conda.io/en/latest/miniconda.html

conda create -n rag-service python=3.12
conda activate rag-service
pip install -r requirements.txt
```

---

## Summary

1. ✅ **Install Python 3.12** (not 3.13)
2. ✅ **Run SETUP-PYTHON-312.bat**
3. ✅ **Start with START-RAG.bat**

That's it! 🚀
