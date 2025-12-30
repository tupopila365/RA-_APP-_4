# How to Index Documents After Adding a PDF

This guide explains the different methods to index PDF documents in your RAG chatbot system.

## Method 1: Automatic Indexing (Recommended)

When you upload a PDF through the backend API, indexing happens automatically.

### Steps:
1. **Upload PDF via Backend API** (POST `/api/documents`)
   - The backend uploads the PDF to Cloudinary
   - Automatically triggers RAG indexing in the background
   - The document's `indexed` status will be updated when complete

2. **Check Indexing Status**
   - The document is created with `indexed: false` initially
   - After indexing completes, it's updated to `indexed: true`
   - You can check the status via GET `/api/documents/:id`

### Example API Call:
```bash
POST /api/documents
Content-Type: multipart/form-data

{
  "title": "Document Title",
  "description": "Document Description",
  "category": "category_name",
  "file": <PDF file>
}
```

## Method 2: Manual Indexing via RAG Service API

If you have a PDF URL (e.g., from Cloudinary) and want to index it manually:

### Steps:
1. **Ensure RAG service is running** on port 8001
2. **Call the indexing endpoint**:

```bash
POST http://localhost:8001/index
Content-Type: application/json

{
  "document_url": "https://res.cloudinary.com/your-cloud/pdf/example.pdf",
  "document_id": "doc_001",
  "title": "Document Title"
}
```

### Example using curl:
```bash
curl -X POST http://localhost:8001/index \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://res.cloudinary.com/your-cloud/pdf/example.pdf",
    "document_id": "doc_001",
    "title": "Document Title"
  }'
```

### Response:
```json
{
  "status": "success",
  "chunks_indexed": 150,
  "document_id": "doc_001"
}
```

## Method 3: Index Local PDF File

If you have a PDF file on your local machine:

### Steps:
1. **Navigate to rag-service directory**:
   ```bash
   cd rag-service
   ```

2. **Activate virtual environment** (if using one):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Run the indexing script**:
   ```bash
   python index_local_pdf.py "<pdf_path>" "<document_id>" "<title>"
   ```

### Example:
```bash
python index_local_pdf.py "../backend/data/documents/RA_NATIS_FAQ.pdf" "doc_002" "RA NATIS FAQ"
```

### Script Output:
The script will show progress through 4 steps:
- 📥 STEP 1/4: Reading PDF file
- 📄 STEP 2/4: Extracting text from PDF
- ✂️ STEP 3/4: Chunking text
- 🔢 STEP 4/4: Generating embeddings and storing in ChromaDB

## Method 4: Re-index an Existing Document

If a document failed to index or you want to re-index it:

### Steps:
1. **Get the document URL** from the database
2. **Use Method 2** (RAG Service API) with the same `document_id` or a new one
3. **Note**: ChromaDB will update existing chunks if using the same `document_id`

## Checking Indexing Status

### Via Backend API:
```bash
GET /api/documents/:id
```

Response includes:
```json
{
  "indexed": true,  // or false
  "fileUrl": "https://...",
  ...
}
```

### Via RAG Service Progress Tracker:
```bash
GET http://localhost:8001/index/progress/:document_id
```

## Troubleshooting

### Indexing Not Starting Automatically
- Check backend logs for errors
- Verify RAG service is running on port 8001
- Check network connectivity between backend and RAG service
- Verify the document URL is accessible

### Indexing Fails
- Check RAG service logs: `rag-service/chroma.log`
- Verify Ollama is running: `ollama list`
- Ensure required models are installed:
  ```bash
  ollama pull nomic-embed-text:latest
  ollama pull llama3.2:1b
  ```

### Manual Re-indexing
If automatic indexing fails, you can manually trigger it:
1. Get the document's `fileUrl` from the database
2. Use Method 2 with the document's `_id` as `document_id`

## Indexing Process Overview

The indexing process includes:
1. **Download PDF** (if from URL) or read local file
2. **Extract text** from all PDF pages
3. **Chunk text** into 500-token chunks with 50-token overlap
4. **Generate embeddings** using Ollama `nomic-embed-text:latest`
5. **Store in ChromaDB** vector database

## Notes

- Indexing is **asynchronous** - the backend doesn't wait for completion
- Large PDFs may take several minutes to index
- Check the `indexed` field in the document to verify completion
- The RAG service provides progress tracking via `/index/progress/:document_id`

