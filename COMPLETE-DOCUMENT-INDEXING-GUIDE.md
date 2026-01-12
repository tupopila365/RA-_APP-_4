# Complete Document Indexing Guide

This guide will walk you through indexing all documents for the RAG chatbot system.

## 📋 Prerequisites

Before indexing documents, ensure these services are running:

### 1. Required Services
- **MongoDB** - Database for storing document metadata
- **Backend API** - Running on port 5000
- **RAG Service** - Running on port 8001
- **Ollama** - AI model service for embeddings

### 2. Required AI Models
The following Ollama models must be installed:
```bash
ollama pull nomic-embed-text:latest    # For embeddings
ollama pull llama3.2:1b               # For text generation
```

## 🚀 Quick Start - Index All Documents

### Method 1: Use the Automated Script (Recommended)

**Step 1: Run the batch indexing script**
```bash
# From the project root directory
.\INDEX-ALL-DOCUMENTS.bat
```

This script will:
- Navigate to the rag-service directory
- Check Python installation
- Run the batch indexing script
- Index all PDFs in `backend/data/documents/`

**Step 2: Monitor the progress**
The script will show detailed progress for each document:
```
📚 Found 5 PDF file(s) to index
📁 Folder: ../backend/data/documents

📄 Processing file 1/5
================================================================================
Indexing local PDF: RA_NATIS_FAQ.pdf
Document ID: doc_ra_natis_faq
Title: Ra Natis Faq
================================================================================

📥 STEP 1/4: Reading PDF file
✓ Read 2,456,789 bytes from PDF

📄 STEP 2/4: Extracting text from PDF
✓ Extracted text from 25 pages (45,678 characters)

✂️ STEP 3/4: Chunking text
✓ Created 89 chunks

🔢 STEP 4/4: Generating embeddings and storing in ChromaDB
Generating embeddings...
✓ Generated 89 embeddings
Storing in ChromaDB...
✓ Stored 89 chunks in ChromaDB

✅ Document indexing completed successfully!
```

### Method 2: Manual Command Line

**Step 1: Navigate to rag-service directory**
```bash
cd rag-service
```

**Step 2: Activate Python virtual environment (if using one)**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**Step 3: Run the indexing script**
```bash
python index_all_local_pdfs.py
```

Or specify a custom folder:
```bash
python index_all_local_pdfs.py "../backend/data/documents"
```

## 📁 Current Documents Available for Indexing

Based on the current setup, these documents will be indexed:

### Documents Folder (`backend/data/documents/`)
1. **RA_NATIS_FAQ.pdf** - Roads Authority NATIS FAQ
2. **What must I do when my motor vehicle becomes permanently unfit for use.pdf** - Vehicle disposal guide
3. **can you give the answers in a more descritive way.pdf** - Detailed service descriptions
4. **give a full descrition of what thier serveces are.pdf** - Complete service descriptions
5. **so the thing is i am working on a rag chatbot for.pdf** - RAG chatbot documentation

### Forms Folder (`backend/data/forms/`)
- Various PLN (Personalized License Number) forms and test documents
- These are primarily form templates and may not need indexing for the chatbot

## 🔧 Advanced Indexing Options

### Index Individual Document

If you want to index a specific document:

```bash
cd rag-service
python index_local_pdf.py "<pdf_path>" "<document_id>" "<title>"
```

Example:
```bash
python index_local_pdf.py "../backend/data/documents/RA_NATIS_FAQ.pdf" "doc_natis_faq" "NATIS FAQ Guide"
```

### Index via API (Remote Documents)

For documents already uploaded to Cloudinary:

```bash
curl -X POST http://localhost:8001/index \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://res.cloudinary.com/your-cloud/pdf/example.pdf",
    "document_id": "doc_001",
    "title": "Document Title"
  }'
```

### Check Indexing Progress

Monitor the progress of document indexing:

```bash
curl http://localhost:8001/index/progress/doc_001
```

## 🔍 Verification Steps

### 1. Check ChromaDB Status

Verify documents are stored in the vector database:

```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "chroma_status": "connected",
  "ollama_status": "connected",
  "indexed_documents": 5
}
```

### 2. Test Chatbot Queries

Test if the indexed documents are working:

```bash
curl -X POST http://localhost:8001/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I register my vehicle?",
    "top_k": 5
  }'
```

### 3. Check Backend Document Status

Verify documents in the backend database:

```bash
curl http://localhost:5000/api/documents
```

Look for `"indexed": true` in the response.

## 📊 Expected Results

After successful indexing, you should see:

### Summary Output
```
📊 INDEXING SUMMARY
================================================================================
Total PDF files found: 5
✅ Successfully indexed: 5
❌ Failed: 0
📦 Total chunks indexed: 450
================================================================================
```

### What Gets Indexed
For each document:
- **Text Extraction**: All text content from PDF pages
- **Chunking**: Text split into 500-token chunks with 50-token overlap
- **Embeddings**: Vector representations using `nomic-embed-text` model
- **Storage**: Chunks stored in ChromaDB vector database
- **Metadata**: Document ID, title, source information

## 🚨 Troubleshooting

### Common Issues and Solutions

**Issue: Python not found**
```bash
# Solution: Install Python 3.9+ and add to PATH
python --version  # Should show Python 3.9+
```

**Issue: Ollama models not found**
```bash
# Solution: Install required models
ollama pull nomic-embed-text:latest
ollama pull llama3.2:1b
ollama list  # Verify models are installed
```

**Issue: ChromaDB connection failed**
```bash
# Solution: Check if ChromaDB is running
# The RAG service starts ChromaDB automatically
curl http://localhost:8001/health
```

**Issue: RAG service not running**
```bash
# Solution: Start the RAG service
cd rag-service
python -m uvicorn app.main:app --reload --port 8001
```

**Issue: Backend not connected to RAG service**
```bash
# Solution: Check backend logs and RAG_SERVICE_URL in backend/.env
# Should be: RAG_SERVICE_URL=http://localhost:8001
```

### Check Service Status

**Backend Health:**
```bash
curl http://localhost:5000/api/health
```

**RAG Service Health:**
```bash
curl http://localhost:8001/health
```

**Ollama Status:**
```bash
ollama list
```

## 🔄 Re-indexing Documents

If you need to re-index documents (e.g., after updates):

### Option 1: Re-run the batch script
```bash
.\INDEX-ALL-DOCUMENTS.bat
```
This will update existing documents with the same document IDs.

### Option 2: Clear and re-index
```bash
cd rag-service
# Clear existing data (optional)
python -c "from app.services.vector_store import VectorStore; VectorStore().clear_all()"

# Re-index all documents
python index_all_local_pdfs.py
```

## 📈 Performance Notes

### Indexing Time
- **Small PDF (1-5 pages)**: 30-60 seconds
- **Medium PDF (10-20 pages)**: 2-5 minutes
- **Large PDF (50+ pages)**: 5-15 minutes

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB for ChromaDB data
- **CPU**: Multi-core recommended for faster embedding generation

### Optimization Tips
- Index documents during off-peak hours
- Ensure stable internet connection for model downloads
- Close unnecessary applications to free up RAM
- Use SSD storage for better performance

## ✅ Success Checklist

After indexing, verify:

- [ ] All PDF files processed successfully
- [ ] No error messages in the output
- [ ] ChromaDB health check passes
- [ ] Backend can connect to RAG service
- [ ] Chatbot responds to test queries
- [ ] Documents show `"indexed": true` in backend API
- [ ] Vector embeddings are stored in ChromaDB

## 🎯 Next Steps

After successful indexing:

1. **Test the Chatbot**: Use the mobile app or admin panel to test chatbot queries
2. **Add More Documents**: Upload additional PDFs through the backend API
3. **Monitor Performance**: Check response times and accuracy
4. **Update Documents**: Re-index when documents are updated
5. **Backup Data**: Consider backing up ChromaDB data regularly

## 📞 Support

If you encounter issues:

1. Check the logs in `rag-service/chroma.log`
2. Verify all services are running
3. Ensure all required models are installed
4. Check network connectivity between services
5. Review the troubleshooting section above

The document indexing system is now ready to power your RAG chatbot with comprehensive, searchable knowledge from your PDF documents!