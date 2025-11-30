# 📊 Viewing Document Indexing Progress in Terminal

## Overview

When you upload a document for indexing, you can watch the entire process in real-time in your terminal where the RAG service is running.

## How to See Progress

### Step 1: Start RAG Service

```bash
cd RA-_APP-_4
START-RAG.bat
```

Keep this terminal window open and visible.

### Step 2: Upload a Document

Go to the Admin Panel: http://localhost:5173/documents

Click "Upload Document" and select a PDF file.

### Step 3: Watch the Terminal

You'll see detailed progress output like this:

```
================================================================================
📥 STEP 1/4: Downloading and extracting text from PDF
================================================================================
✅ Successfully extracted 15234 characters from 10 pages

================================================================================
✂️  STEP 2/4: Chunking text into overlapping segments
================================================================================
✅ Created 25 chunks from document

================================================================================
🧠 STEP 3/4: Generating embeddings for 25 chunks
================================================================================
📊 Embedding progress: 1/25 (4.0%) - Chunk 1 embedded
📊 Embedding progress: 2/25 (8.0%) - Chunk 2 embedded
📊 Embedding progress: 3/25 (12.0%) - Chunk 3 embedded
...
📊 Embedding progress: 25/25 (100.0%) - Chunk 25 embedded
✅ Successfully generated embeddings for 25 chunks

================================================================================
💾 STEP 4/4: Storing embeddings in vector database
================================================================================
✅ Successfully indexed 25 chunks for document doc_123

================================================================================
🎉 INDEXING COMPLETE!
📄 Document: My Document.pdf
🔢 Total chunks indexed: 25
================================================================================
```

## What Each Step Means

### 📥 Step 1: Download & Extract
- Downloads PDF from URL
- Extracts text from all pages
- Shows total characters and pages

### ✂️ Step 2: Chunking
- Splits text into overlapping segments
- Each chunk is ~500 tokens
- Shows total number of chunks created

### 🧠 Step 3: Generate Embeddings
- Creates vector embeddings for each chunk
- Uses Ollama with `nomic-embed-text` model
- Shows progress for every single chunk
- **This is the slowest step** (takes ~2-3 seconds per chunk)

### 💾 Step 4: Store in Database
- Saves embeddings to ChromaDB
- Stores metadata (title, page numbers, etc.)
- Very fast (< 1 second)

## Timing Estimates

| Document Size | Chunks | Embedding Time | Total Time |
|---------------|--------|----------------|------------|
| 1-5 pages | 5-10 | 10-30 seconds | 20-40 seconds |
| 5-10 pages | 10-20 | 30-60 seconds | 45s - 1.5 min |
| 10-25 pages | 20-50 | 1-2.5 minutes | 2-4 minutes |
| 25-50 pages | 50-100 | 2.5-5 minutes | 5-8 minutes |

## Tips for Better Visibility

### 1. Use a Dedicated Terminal

Keep the RAG service terminal visible on a second monitor or split screen.

### 2. Increase Terminal Buffer

If you have a long document, increase your terminal's scrollback buffer:
- **Windows Terminal:** Settings → Profiles → Advanced → History size (set to 10000)
- **PowerShell:** Right-click title bar → Properties → Layout → Screen Buffer Size

### 3. Watch Multiple Documents

You can upload multiple documents simultaneously. Each will show its own progress with its document_id.

### 4. Check Progress via API

You can also check progress programmatically:

```bash
curl http://localhost:8001/api/index/progress/doc_123
```

Returns:
```json
{
  "status": "success",
  "data": {
    "status": "indexing",
    "stage": "embedding",
    "percentage": 45.5,
    "message": "Generating embeddings for 25 chunks...",
    "chunks_processed": 12,
    "total_chunks": 25
  }
}
```

## Troubleshooting

### No Output Showing

**Problem:** Terminal shows nothing during indexing

**Solution:**
1. Check log level in `.env`:
   ```
   LOG_LEVEL=INFO
   ```
2. Restart RAG service
3. Make sure you're watching the correct terminal

### Progress Stuck

**Problem:** Progress stops at a certain percentage

**Possible causes:**
1. **Ollama not responding** - Check if Ollama is running
2. **Model not loaded** - First chunk takes longer as model loads
3. **Network issue** - Check Ollama connection

**Solution:**
```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Restart Ollama if needed
ollama serve
```

### Too Much Output

**Problem:** Too many log messages

**Solution:** Change log level to WARNING in `.env`:
```
LOG_LEVEL=WARNING
```

This will only show warnings and errors, not progress.

## Example: Full Indexing Session

```
2025-11-30 18:45:23 - app.routers.index - INFO - Starting document indexing for document_id=doc_456, title=User Manual.pdf
================================================================================
📥 STEP 1/4: Downloading and extracting text from PDF
================================================================================
2025-11-30 18:45:25 - app.services.pdf_processor - INFO - Downloaded PDF: 2.3 MB
2025-11-30 18:45:26 - app.services.pdf_processor - INFO - Extracted text from 15 pages
✅ Successfully extracted 18456 characters from 15 pages

================================================================================
✂️  STEP 2/4: Chunking text into overlapping segments
================================================================================
2025-11-30 18:45:26 - app.utils.chunking - INFO - Chunking with size=500, overlap=50
✅ Created 32 chunks from document

================================================================================
🧠 STEP 3/4: Generating embeddings for 32 chunks
================================================================================
📊 Embedding progress: 1/32 (3.1%) - Chunk 1 embedded
📊 Embedding progress: 2/32 (6.2%) - Chunk 2 embedded
📊 Embedding progress: 3/32 (9.4%) - Chunk 3 embedded
... (continues for all 32 chunks)
📊 Embedding progress: 32/32 (100.0%) - Chunk 32 embedded
✅ Successfully generated embeddings for 32 chunks

================================================================================
💾 STEP 4/4: Storing embeddings in vector database
================================================================================
2025-11-30 18:47:15 - app.services.vector_store - INFO - Storing 32 chunks in ChromaDB
✅ Successfully indexed 32 chunks for document doc_456

================================================================================
🎉 INDEXING COMPLETE!
📄 Document: User Manual.pdf
🔢 Total chunks indexed: 32
================================================================================
```

## Summary

✅ Start RAG service with `START-RAG.bat`  
✅ Keep terminal visible  
✅ Upload document via Admin Panel  
✅ Watch real-time progress in terminal  
✅ See detailed progress for each chunk  
✅ Get completion notification  

**Enjoy watching your documents get indexed!** 🚀
