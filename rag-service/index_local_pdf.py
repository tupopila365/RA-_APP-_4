#!/usr/bin/env python3
"""Script to index a local PDF file directly into ChromaDB."""

import sys
import os
import logging
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.pdf_processor import PDFProcessor
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.utils.chunking import TextChunker
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def index_local_pdf(pdf_path: str, document_id: str, title: str):
    """
    Index a local PDF file into ChromaDB.
    
    Args:
        pdf_path: Path to the PDF file
        document_id: Unique identifier for the document
        title: Title of the document
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        logger.error(f"PDF file not found: {pdf_path}")
        return False
    
    if not pdf_path.suffix.lower() == '.pdf':
        logger.error(f"File is not a PDF: {pdf_path}")
        return False
    
    logger.info("=" * 80)
    logger.info(f"Indexing local PDF: {pdf_path}")
    logger.info(f"Document ID: {document_id}")
    logger.info(f"Title: {title}")
    logger.info("=" * 80)
    
    try:
        # Step 1: Read PDF file
        logger.info("\n📥 STEP 1/4: Reading PDF file")
        with open(pdf_path, 'rb') as f:
            pdf_content = f.read()
        logger.info(f"✓ Read {len(pdf_content)} bytes from PDF")
        
        # Step 2: Extract text from PDF
        logger.info("\n📄 STEP 2/4: Extracting text from PDF")
        pdf_processor = PDFProcessor()
        pdf_data = pdf_processor.extract_text_from_pdf(pdf_content, document_id=document_id)
        logger.info(f"✓ Extracted text from {pdf_data['num_pages']} pages ({len(pdf_data['text'])} characters)")
        
        # Step 3: Chunk the text
        logger.info("\n✂️  STEP 3/4: Chunking text")
        chunker = TextChunker(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        document_metadata = {
            'document_id': document_id,
            'title': title,
            'source': str(pdf_path)
        }
        
        chunks = chunker.chunk_document_pages(pdf_data['page_texts'], document_metadata)
        logger.info(f"✓ Created {len(chunks)} chunks")
        
        # Step 4: Generate embeddings and store in ChromaDB
        logger.info("\n🔢 STEP 4/4: Generating embeddings and storing in ChromaDB")
        embedding_service = EmbeddingService()
        vector_store = VectorStore()
        
        # Generate embeddings for all chunks (pass chunks directly, not just text)
        logger.info("Generating embeddings...")
        embedded_chunks = embedding_service.embed_chunks(chunks)
        logger.info(f"✓ Generated {len(embedded_chunks)} embeddings")
        
        # Store in ChromaDB
        logger.info("Storing in ChromaDB...")
        chunks_indexed = vector_store.add_documents(
            chunks=embedded_chunks,
            document_id=document_id,
            document_title=title
        )
        logger.info(f"✓ Stored {chunks_indexed} chunks in ChromaDB")
        
        logger.info("\n" + "=" * 80)
        logger.info("✅ Document indexing completed successfully!")
        logger.info(f"   Document ID: {document_id}")
        logger.info(f"   Title: {title}")
        logger.info(f"   Chunks indexed: {chunks_indexed}")
        logger.info("=" * 80)
        
        return True
        
    except Exception as e:
        logger.error(f"\n❌ Failed to index document: {str(e)}", exc_info=True)
        return False


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python index_local_pdf.py <pdf_path> <document_id> <title>")
        print("\nExample:")
        print('  python index_local_pdf.py "../backend/data/documents/NATIS_FAQ.pdf" "doc_001" "RA NATIS FAQ"')
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    document_id = sys.argv[2]
    title = sys.argv[3]
    
    success = index_local_pdf(pdf_path, document_id, title)
    sys.exit(0 if success else 1)

