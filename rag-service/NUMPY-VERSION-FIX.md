# NumPy Version Compatibility Fix

## Issue

You're seeing this error:
```
AttributeError: `np.float_` was removed in the NumPy 2.0 release
```

## Problem

- **NumPy 2.0** was installed (too new)
- **ChromaDB 0.4.22** only supports NumPy 1.x
- They're incompatible

## ✅ Quick Fix

Run these commands:

```bash
cd RA-_APP-_4\rag-service
venv\Scripts\activate
pip uninstall -y numpy
pip install "numpy>=1.22.5,<2.0.0"
```

## Verify Fix

```bash
python -c "import chromadb; import numpy; print(f'NumPy: {numpy.__version__}')"
```

Should show: `NumPy: 1.26.4`

## Start RAG Service

```bash
cd RA-_APP-_4
START-RAG.bat
```

## Why This Happens

| Package | Version | NumPy Support |
|---------|---------|---------------|
| ChromaDB 0.4.22 | Current | NumPy 1.x only |
| NumPy 2.0+ | Latest | Breaking changes |

ChromaDB hasn't updated to support NumPy 2.0 yet.

## Permanent Fix

The `requirements.txt` has been updated to:
```
numpy>=1.22.5,<2.0.0
```

This ensures NumPy 1.x is always installed.

---

**Status:** ✅ Fixed! NumPy 1.26.4 is now installed and compatible with ChromaDB.
